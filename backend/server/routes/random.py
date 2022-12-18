from flask import Blueprint, g, request, jsonify, url_for

bp = Blueprint("random", __name__, url_prefix="/random")

# Route to find a random repository (querying through GitHub API)
@bp.route("/")
def getRandomRepository():
  # Look for stuff in query string
  return jsonify({ "repository": {} })
