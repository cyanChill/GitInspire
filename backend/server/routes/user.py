from flask import Blueprint, g, request, jsonify, url_for
from flask_jwt_extended import jwt_required
import traceback

from server.db import db
from server.models.User import User

bp = Blueprint("user", __name__, url_prefix="/user")

# Route to get all users
@bp.route("/")
def get_users():
    return jsonify({"users": []})


# Route to get general information on the user
@bp.route("/<int:userId>")
def get_user(userId):
    user = User.query.filter_by(id=userId).first()

    if user != None:
        return jsonify({"message": "User found.", "user": user.as_dict()}), 200
    else:
        return jsonify({"message": "User not found.", "user": None}), 200


# Route to refresh user info from GitHub API
@bp.route("/<int:userId>/refresh")
def refresh_user(userId):
    return jsonify({"message": "Route to 'refresh' user info."})


# Route to get the tags & repositories user has contributed to GitInspire
@bp.route("/<int:userId>/contributions")
def get_user_contributions(userId):
    return jsonify({"tags": [], "repositories": []})


# Route to delete account
@bp.route("/<int:userId>", methods=["DELETE"])
@jwt_required()
def delete_user(userId):
    return jsonify({"message": "Deleted account."})
