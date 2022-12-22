from flask import Blueprint, g, request, jsonify, current_app as app
from functools import wraps
import requests
from urllib.parse import parse_qs
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    get_jwt_identity,
    jwt_required,
    set_access_cookies,
    set_refresh_cookies,
    verify_jwt_in_request,
    unset_jwt_cookies,
)

from server.db import db
from server.models.User import User, AccountStatusEnum


bp = Blueprint("auth", __name__, url_prefix="/auth")

# Will can put "@admin_required" before routes that requires admin permissions
#  Ref: https://flask-jwt-extended.readthedocs.io/en/stable/custom_decorators/
def admin_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            try:
                verify_jwt_in_request()
                if g.user.account_status.value >= 50:
                    return fn(*args, **kwargs)
                else:
                    return jsonify({"message": "Admin only."}), 403
            except:
                return jsonify({"message": "User is not authenticated."}), 401

        return decorator

    return wrapper


# Will can put "@owner_required" before routes that requires owner permissions
def owner_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            try:
                verify_jwt_in_request()
                if g.user.account_status.value == 100:
                    return fn(*args, **kwargs)
                else:
                    return jsonify({"message": "Owner only."}), 403
            except:
                return jsonify({"message": "User is not authenticated."}), 401

        return decorator

    return wrapper


# Runs before every request, regardless of route
#  - Sets "g.user" to user data from database if JWT & CSRF tokens are
#    valid & provided
@bp.before_app_request
def get_user_from_jwt():
    try:
        # Get user id from JWT if valid (requires "X-CSRF-TOKEN" in request headers)
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        # Look for user in database
        existing_user = User.query.filter_by(id=user_id).first()
        g.user = existing_user  # Either None or user data
    except:
        # No JWT token, didn't provide "X-CSRF-TOKEN" in request, or
        # error is thrown from query for user
        g.user = None


# The "login" route based off of temporary Github OAuth code (from frontend)
@bp.route("/authenticate", methods=["POST"])
def authenicateOAuth():
    # What we want as a response from Github API for authentication
    github_user_data = None

    try:
        # Get temporary code from frontend
        code = request.json["code"]
        # Get access token (ie: Returns "access_token=blahblahblahblah")
        acs_tk_resp = requests.post(
            "https://github.com/login/oauth/access_token",
            data={
                "client_id": app.config["GITHUB_CLIENT_ID"],
                "client_secret": app.config["GITHUB_CLIENT_SECRET"],
                "code": code,
                "redirect_uri": app.config["GITHUB_REDIRECT_URI"],
            },
        )
        access_token = parse_qs(acs_tk_resp.text)["access_token"][0]

        # Request user data of authenticated user
        usr_dt_resp = requests.get(
            "https://api.github.com/user",
            headers={"Authorization": f"token {access_token}"},
        )
        github_user_data = usr_dt_resp.json()
    except:
        return jsonify({"message": "Failed to authenticate user."}), 401

    user_id = github_user_data["id"]
    # Checks to see if user exist in database, if not, create new user
    existing_user = User.query.filter_by(id=user_id).first()

    if not existing_user:
        try:
            # Create new user
            existing_user = User(
                id=user_id,
                username=github_user_data["login"],
                avatar_url=github_user_data["avatar_url"],
                github_created_at=github_user_data["created_at"],
                account_status=AccountStatusEnum["user"],
            )
            db.session.add(existing_user)
            db.session.commit()
        except:
            return jsonify({"message": "Something went wrong with creating user."}), 500

    # Generate JWT we'll be sending to the user
    #  Ref: https://flask-jwt-extended.readthedocs.io/en/3.0.0_release/tokens_in_cookies/
    jwt_access_token = create_access_token(identity=user_id)
    jwt_refresh_token = create_refresh_token(identity=user_id)

    # Pass serialized user data in response
    resp = jsonify({"user_data": existing_user.as_dict()})
    set_access_cookies(resp, jwt_access_token)
    set_refresh_cookies(resp, jwt_refresh_token)
    return resp


# Route to refresh token
@bp.route("/token/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh_token():
    # Create the new access token
    current_user_id = get_jwt_identity()
    access_token = create_access_token(identity=current_user_id)

    # Set the JWT access cookie in the response
    resp = jsonify({"refresh": True})
    set_access_cookies(resp, access_token)
    return resp


# Send response to frontend to delete cookies to logout.
@bp.route("/logout")
def logout():
    resp = jsonify({"logout": True})
    unset_jwt_cookies(resp)
    return resp
