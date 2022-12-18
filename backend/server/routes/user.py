from flask import Blueprint, g, request, jsonify, url_for

bp = Blueprint("user", __name__, url_prefix="/user")

# Route to get all users
@bp.route("/")
def getUsers():
    return jsonify({"users": []})


# Route to get general information on the user
@bp.route("/<int:userId>")
def userInfo(userId):
    return jsonify({"message": "Basic user info"})


# Route to refresh user info from Github API
@bp.route("/<int:userId>/refresh")
def refreshUserInfo(userId):
    return jsonify({"message": "Route to 'refresh' user info."})


# Route to get the tags & repositories user has contributed to Repot
@bp.route("/<int:userId>/contributions")
def userContributions(userId):
    return jsonify({"tags": [], "repositories": []})


# Route to delete account
@bp.route("/<int:userId>/delete", ["DELETE"])
def deleteAccount(userId):
    return jsonify({"message": "Deleted account."})
