from flask import Blueprint, g, request, jsonify, url_for, redirect
from flask import current_app as app
import requests
from urllib.parse import parse_qs

bp = Blueprint("auth", __name__, url_prefix="/auth")

# Runs before the view function
@bp.before_app_request
def load_logged_in_user():
    g.__extraRequestdata__ = "Basically ExpressJS's app.use()"


# The "login" route based off of temporary Github OAuth code (from frontend)
@bp.route("/authenticate", methods=["POST"])
def authenicateOAuth():
    # Get access token from temporary code (obtained in frontend)
    code = request.json["code"]

    acs_tk_resp = requests.post(
        "https://github.com/login/oauth/access_token",
        data={
            "client_id": app.config["GITHUB_CLIENT_ID"],
            "client_secret": app.config["GITHUB_CLIENT_SECRET"],
            "code": code,
            "redirect_uri": app.config["GITHUB_REDIRECT_URI"],
        },
    )
    # Returns "access_token=blahblahblahblah"
    access_token = parse_qs(acs_tk_resp.text)["access_token"][0]

    # Request user data of authenticated user
    usr_dt_resp = requests.get(
        "https://api.github.com/user",
        headers={"Authorization": f"token {access_token}"},
    )
    user_data = usr_dt_resp.json()
    print(user_data)

    # Get user id to concretely identify user
    user_id = user_data["id"]
    print(f"\nUser Id: {user_id}")
    # Do stuff with user data
    #  - Check if user is in database, if not, create new entry
    #  - Create JWT token & send back to frontend through (ie: cookies)

    return jsonify({"user_data": user_data})


# Route to validate user session from cookie
@bp.route("/validate_session")
def validate_session():
    pass


@bp.route("/logout")
def logout():
    return jsonify({"message": "Pinged /logout"})
