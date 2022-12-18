from flask import Blueprint, g, request, jsonify, url_for

bp = Blueprint("repositories", __name__, url_prefix="/repositories")

# Route to get all repositories
@bp.route("/")
def getRepositories():
    return jsonify({"repositories": []})


# Route to filter repositories
@bp.route("/filter")
def repositoryInfo():
    # Look for stuff in query string
    return jsonify({"message": "Basic repository info"})


# Route to get information on a specific repository
@bp.route("/<int:repoId>")
def repositoryInfo(repoId):
    return jsonify({"message": "Basic repository info"})


# Route to suggest a repository
@bp.route("/create", methods=["POST"])
def suggestRepository():
    return jsonify({"message": "Suggested repository."})


# Route to refresh repository info from Github API
@bp.route("/<int:repoId>/refresh")
def refreshRepositoryInfo(repoId):
    return jsonify({"message": "Route to 'refresh' repository info."})


# Route to update a repository
@bp.route("/<int:repoId>/update", methods=["PATCH"])
def updateRepository(repoId):
    return jsonify({"message": "Updated repository."})


# Route to delete a repository
@bp.route("/<int:repoId>/delete", methods=["DELETE"])
def deleteRepository(repoId):
    return jsonify({"message": "Delete repository."})
