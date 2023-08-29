from flask import Blueprint, g, jsonify, request, current_app as app
from sqlalchemy import update, text
import requests
import traceback

from server.routes.auth import admin_required
from server.utils import isXDayOld, serialize_sqlalchemy_objs
from server.db import db
from server.models.User import User, AccountStatusEnum
from server.models.Log import Log

bp = Blueprint("users", __name__, url_prefix="/users")


# Route to get general information on the user
@bp.route("/<int:userId>")
def get_user(userId):
    # Get current user if exists
    calling_user = g.user
    if calling_user:
        calling_user = calling_user.as_dict()

    user = User.query.filter_by(id=userId).first()

    if user != None:
        # Hide ban reason from response if user isn't admin or owner
        user_res = user.as_dict()
        if not calling_user or (
            calling_user["account_status"] != "admin"
            and calling_user["account_status"] != "owner"
        ):
            user_res["ban_reason"] = None

        response = {
            "message": "User found.",
            "user": user_res,
            "contributions": user.contributions(),
        }
        return jsonify(response), 200
    else:
        response = {"message": "User not found.", "user": None, "contributions": None}
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
        response = {
            "message": "Rate limit was hit, validation failed, or endpoint has been spammed."
        }
        return jsonify(response), 500

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


# Route to get all banned users
@bp.route("/banned", methods=["GET"])
@admin_required()
def get_banned_users():
    banned_users = User.query.filter_by(account_status="banned").all()
    if banned_users != None:
        banned_users = serialize_sqlalchemy_objs(banned_users)
    else:
        banned_users = []
    return jsonify({"message": "Obtained banned users.", "users": banned_users})


# Route to update account
@bp.route("/<int:userId>", methods=["PATCH"])
@admin_required()
def update_user(userId):
    user = g.user.as_dict()

    # Prevent admin/owner from updating their data
    if user["id"] == userId:
        return jsonify({"message": "You cannot update yourself."}), 400

    account_status = request.json.get("account_status", None)
    ban_reason = request.json.get("ban_reason", None)

    if not account_status:
        response = {"message": "You must provide an account status."}
        return jsonify(response), 400

    if account_status not in ["user", "banned", "admin"]:
        response = {"message": f'"{account_status}" is an invalid account status.'}
        return jsonify(response), 400

    if account_status == "admin" and user["account_status"] != "owner":
        response = {"message": "You don't have permission to set this account status."}
        return jsonify(response), 400

    # Fetch user we're updating
    existing_user = User.query.filter_by(id=userId).first()

    if existing_user == None:
        response = {"message": "User does not exist in the database."}
        return jsonify(response), 400

    upd_user_dict = existing_user.as_dict()

    if (
        upd_user_dict["account_status"] == account_status
        and upd_user_dict["ban_reason"] == ban_reason
    ):
        response = {"message": "Nothing is being updated."}
        return jsonify(response), 400

    # Prevent admins from updating other admin & owner data
    if upd_user_dict["account_status"] == "owner" or (
        upd_user_dict["account_status"] == "admin" and user["account_status"] != "owner"
    ):
        response = {"message": "You don't have permission to update this user."}
        return jsonify(response), 400

    try:
        action_msg = (
            "update ({} -> {})".format(upd_user_dict["account_status"], account_status)
            if account_status != upd_user_dict["account_status"]
            else "update (ban reason)"
        )

        # Updating user
        update_stmt = (
            update(User)
            .filter_by(id=userId)
            .values(
                account_status=AccountStatusEnum[account_status], ban_reason=ban_reason
            )
        )
        db.session.execute(update_stmt)
        db.session.commit()

        # Log the update action
        log = Log(
            action=action_msg,
            type="user",
            content_id=userId,
            enacted_by=user["id"],
        )
        try:
            db.session.execute(
                text(
                    "SELECT setval(pg_get_serial_sequence('logs', 'id'), coalesce(max(id)+1, 1), false) FROM logs"
                )
            )
        except:
            pass
        db.session.add(log)
        db.session.commit()

        response = {
            "message": "Successfully updated user.",
            "user": existing_user.as_dict(),
        }
        return jsonify(response), 200
    except:
        print(traceback.format_exc())
        response = {"message": "Something went wrong with updating user."}
        return jsonify(response), 500
