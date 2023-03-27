from flask import Blueprint, g, request, jsonify, current_app as app
from flask_jwt_extended import jwt_required
from sqlalchemy import update
import requests
import traceback

from server.utils import isXDayOld
from server.db import db
from server.models.User import User

bp = Blueprint("user", __name__, url_prefix="/users")

# Route to get all users
@bp.route("/")
def get_users():
    return jsonify({"users": []})


# Route to get general information on the user
@bp.route("/<int:userId>")
def get_user(userId):
    user = User.query.filter_by(id=userId).first()

    if user != None:
        response = {
            "message": "User found.",
            "user": user.as_dict(),
            "contributions": user.contributions(),
        }
        return jsonify(response), 200
    else:
        response = {"message": "User found.", "user": None, "contributions": None}
        return jsonify(response), 200


# Route to refresh user info from GitHub API
@bp.route("/<int:userId>/refresh")
def refresh_user(userId):
    # Get local copy of user & check it hasn't been updated in the last day
    existing_user = User.query.filter_by(id=userId).first()
    if existing_user == None:
        response = {"message": f"User with user id {userId} doesn't exist."}
        return jsonify(response), 404

    if not isXDayOld(existing_user.last_updated, 1):
        response = {
            "message": "User has been recently updated.",
            "user": existing_user.as_dict(),
        }
        return jsonify(response), 200

    # Call GitHub API since user data can be refreshed
    user_data_resp = requests.get(
        f"https://api.github.com/user/{userId}",
        auth=(app.config["GITHUB_CLIENT_ID"], app.config["GITHUB_CLIENT_SECRET"]),
        headers={
            "Accept": "application/vnd.github.text-match+json",
            "User-Agent": "gitinspire-server",
        },
    )

    # Handle case where rate limit was hit, validation failed, endpoint has been spammed
    if user_data_resp.status_code in [403, 422]:
        return jsonify({"message": "Something else went wrong."}), 500

    # Handle case where user is no longer accessible via the API
    if user_data_resp.status_code == 404:
        response = {
            "message": "User is no longer accessible via the GitHub API.",
            "user": existing_user.as_dict(),
        }
        return jsonify(response), 410

    # Handle case where no modifications was made
    if user_data_resp.status_code == 304:
        # "Touch" User entry to trigger onupdate event to update "last_update"
        stmt = update(User).where(User.id == userId)
        db.engine.execute(stmt)
        response = {
            "message": "No changes was found.",
            "user": existing_user.as_dict(),
        }
        return jsonify(response), 200

    # Some other untracked error
    if not user_data_resp.ok:
        return jsonify({"message": "An unknown error has occurred."}), 500

    # Handling case where modifications were made
    updt_user_data = user_data_resp.json()
    update_dict = {
        "username": updt_user_data["login"],
        "avatar_url": updt_user_data["avatar_url"],
    }

    try:
        # Commiting update
        update_stmt = update(User).filter_by(id=userId).values(**update_dict)
        db.session.execute(update_stmt)
        db.session.commit()
    except:
        print(traceback.format_exc())
        response = {"message": "Something went wrong with refreshing user data."}
        return jsonify(response), 500

    response = {
        "message": "Refreshed user information.",
        "user": existing_user.as_dict(),
    }
    return jsonify(response), 200


# Route to get the tags & repositories user has contributed to GitInspire
@bp.route("/<int:userId>/contributions")
def get_user_contributions(userId):
    return jsonify({"tags": [], "repositories": []})


# Route to delete account
@bp.route("/<int:userId>", methods=["DELETE"])
@jwt_required()
def delete_user(userId):
    return jsonify({"message": "Deleted account."})
