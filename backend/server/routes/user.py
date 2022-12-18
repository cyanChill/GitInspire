from flask import Blueprint, g, request, jsonify, url_for

bp = Blueprint("user", __name__, url_prefix="/user")

# Route to get general information on the user
@bp.route("/<int:userid>")
def userInfo():
  return jsonify({ "message": "Basic user info" })


# Route to refresh user info from Github API
@bp.route("/<int:userid>/refresh")
def refreshUserInfo():
  return jsonify({ "message": "Route to 'refresh' user info." })


# Route to get the tags & repositories user has contributed to Repot
@bp.route("/<int:userid>/contributions")
def userContributions():
  return jsonify({ "tags": [], "repositories": [] })


# Route to delete account
@bp.route("/<int:userid>/delete", methods=("DELETE"))
def deleteAccount():
  return jsonify({ "message": "Deleted account." })
