from flask import Blueprint, g, request, jsonify
from flask_jwt_extended import jwt_required
import requests
import traceback

from server.utils import isXMonthOld, filterLangs, normalizeStr
from server.routes.auth import not_banned
from server.db import db
from server.models.Language import Language
from server.models.Tag import Tag
from server.models.Repository import Repository, RepoLanguage, RepoTag

bp = Blueprint("repositories", __name__, url_prefix="/repositories")

# Route to get all repositories
@bp.route("/")
def getRepositories():
    return jsonify({"repositories": []})


# Route to filter repositories
@bp.route("/filter")
def filteredRepositories():
    # Look for stuff in query string
    return jsonify({"message": "Filtered repositories."})


# Route to get information on a specific repository
@bp.route("/<int:repoId>")
def repositoryInfo(repoId):
    return jsonify({"message": "Basic repository info"})


# Route to suggest a repository
@bp.route("/create", methods=["POST"])
@jwt_required()
@not_banned()
def suggestRepository():
    user = g.user.as_dict()

    if not isXMonthOld(user["github_created_at"], 3):
        return (
            jsonify(
                {
                    "message": "GitHub account age isn't old enough to suggest repository (must be older than 3 months)."
                }
            ),
            403,
        )

    # request.json.get("", default="")
    author = request.json.get("author", "").strip()
    repo_name = request.json.get("repo_name", "").strip()
    if author == "" or repo_name == "":
        return jsonify({"message": "One or more of your inputs are empty."}), 400

    # {label: "",  value:""} - same as {display_name:"", name:""}:
    primary_tag = request.json.get("primary_tag")
    tags = request.json.get("tags", [])  # [{label: "",  value:""}]:

    try:
        tags_existence = []
        # See if primary tag exists
        tags_existence.append(Tag.query.filter_by(name=primary_tag["value"]).first())
        # See if additional tags exist
        for tg in tags:
            tags_existence.append(Tag.query.filter_by(name=tg["value"]).first())

        for tg in tags_existence:
            if tg == None:
                return jsonify({"message": "Invalid tags."}), 400
    except:
        print(traceback.format_exc())
        return jsonify({"message": "Something went wrong with validating tags."}), 500

    # Find repository information from GitHub
    repo_dt_resp = requests.get(f"https://api.github.com/repos/{author}/{repo_name}")
    repo_data = repo_dt_resp.json()
    if not repo_dt_resp.ok:
        return jsonify({"message": "Repository was not found."}), 500

    # Check if repository already exists in our database
    if Repository.query.filter_by(id=repo_data["id"]).first() != None:
        return (
            jsonify(
                {
                    "message": "Repository already exists in our database.",
                    "repo_id": repo_data["id"],
                }
            ),
            200,
        )

    # Get languages
    repo_lang_dt_resp = requests.get(repo_data["languages_url"])
    repo_lang_data = repo_lang_dt_resp.json()
    if not repo_lang_dt_resp.ok:
        return jsonify({"message": "Failed to find repository languages."}), 500

    # Add languages to database if they don't exist
    sorted_langs = filterLangs(repo_lang_data)
    for lg in sorted_langs:
        if Language.query.filter_by(name=normalizeStr(lg)).first() == None:
            new_lang = Language(name=normalizeStr(lg), display_name=lg)
            db.session.add(new_lang)
    db.session.commit()

    try:
        # Add repository to our database
        new_repo = Repository(
            id=repo_data["id"],
            author=repo_data["owner"]["login"],
            repo_name=repo_data["name"],
            description=repo_data["description"],
            stars=repo_data["stargazers_count"],
            _primary_tag=primary_tag["value"],
            suggested_by=user["id"],
        )
        db.session.add(new_repo)
        db.session.commit()
    except:
        print(traceback.format_exc())
        return jsonify({"message": "Failed to create repository."}), 500

    try:
        # Create langauge relations with repository (if languages exist)
        if sorted_langs:
            for idx, lg in enumerate(sorted_langs):
                new_lang_rel = RepoLanguage(
                    repo_id=repo_data["id"],
                    language_name=normalizeStr(lg),
                    is_primary=(idx == 0),
                )
                db.session.add(new_lang_rel)
        # Create (regular) tag relations with repository
        if len(tags) > 0:
            for tg in tags:
                new_tag_rel = RepoTag(repo_id=repo_data["id"], tag_name=tg["value"])
                db.session.add(new_tag_rel)
        # Save changes
        db.session.commit()
    except:
        print(traceback.format_exc())
        return (
            jsonify({"message": "Failed to create repository associations."}),
            500,
        )

    return (
        jsonify(
            {
                "message": "Successfully suggested repository.",
                "repository": Repository.query.filter_by(id=repo_data["id"])
                .first()
                .as_dict(),
                "repo_id": repo_data["id"],
            }
        ),
        200,
    )


# Route to refresh repository info from GitHub API
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
