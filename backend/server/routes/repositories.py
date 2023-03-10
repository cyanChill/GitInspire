from flask import Blueprint, g, jsonify, request
from flask_jwt_extended import jwt_required
import requests
from math import ceil
import traceback

from server.utils import (
    isXMonthOld,
    filterLangs,
    normalizeStr,
    serialize_sqlalchemy_objs,
)
from server.routes.auth import not_banned
from server.db import db
from server.models.Language import Language
from server.models.Tag import Tag
from server.models.Repository import Repository, RepoLanguage, RepoTag

bp = Blueprint("repositories", __name__, url_prefix="/repositories")


@bp.route("/filter")
def filtered_repositories():
    # Parse the JSON data in the request's body.
    filter_data = request.args.to_dict()
    print("\nArgs:", filter_data)
    # Extracting values from query string
    limit = request.args.get("limit", default=15, type=int)
    if limit != None and limit <= 0:
        limit = 15
    page = request.args.get("page", default=0, type=int)
    if page != None and page < 0:
        page = 0
    minStars = request.args.get("minStars", default=0, type=int)
    if minStars != None and minStars < 0:
        minStars = 0
    maxStars = request.args.get("maxStars", type=int)
    if maxStars != None and maxStars < 0:
        maxStars = None
    # Suppress error with maxStars < minStars
    if maxStars and maxStars < minStars:
        maxStars = None

    primary_tag = request.args.get("primary_tag", type=str)
    if primary_tag:
        primary_tag = normalizeStr(primary_tag.strip())
    tags = request.args.get("tags", type=str)
    if tags:
        tags = [normalizeStr(tg.strip()) for tg in tags.split(",")]
    languages = request.args.get("languages", type=str)
    if languages:
        languages = [normalizeStr(lang.strip()) for lang in languages.split(",")]

    # Sorting Filters
    sortOpts = ["stars"]
    sort = request.args.get("sort", type=str)
    sort = sort if sort in sortOpts else None

    order = request.args.get("order", default="asc", type=str)
    order = "desc" if order == "desc" else "asc"

    # Create query & apply filters
    query = db.session.query(Repository)
    query = query.filter(Repository.stars >= minStars)
    if maxStars:
        query = query.filter(Repository.stars <= maxStars)
    if primary_tag:
        query = query.filter(Repository._primary_tag == primary_tag)
    if tags:
        # Stack filters such that entries that pass the filters have all the
        # specified tags via RepoTag relations
        for tag in tags:
            query = query.filter(Repository.tags.any(tag_name=tag))
    if languages:
        for lang in languages:
            query = query.filter(Repository.languages.any(language_name=lang))
    # Apply sorting order
    if sort == "stars":
        if order == "desc":
            query = query.order_by(Repository.stars.desc())
        else:
            query = query.order_by(Repository.stars)

    # How to deal with getting results after "skipping" (offset)
    # https://stackoverflow.com/q/52803570

    # To also return number of remaining pages - counting number of
    # possible remaining entries (for pagnation purposes)
    # https://stackoverflow.com/q/10822635
    try:
        numEntries = query.count()
        results = query.offset(page * limit).limit(limit).all()

        response = {
            "message": "Found results.",
            "currPage": page,
            "numPages": ceil(numEntries / limit),
            "repositories": serialize_sqlalchemy_objs(results),
        }
        return jsonify(response), 200
    except:
        print(traceback.format_exc())
        response = {
            "message": "Something went wrong with searching our database with the provided filters."
        }
        return jsonify(response), 500


@bp.route("/<int:repoId>")
def get_repository(repoId):
    repo = Repository.query.filter_by(id=repoId).first()

    if repo != None:
        response = {"message": "Repository found.", "repository": repo.as_dict()}
        return jsonify(response), 200

    else:
        return jsonify({"message": "Repository not found.", "repository": None}), 200


@bp.route("/", methods=["POST"])
@jwt_required()
@not_banned()
def create_repository():
    # Validate that the account age of the user creating the tag is >3 months.
    user = g.user.as_dict()
    if not isXMonthOld(user["github_created_at"], 3):
        response = {
            "message": "GitHub account age must be older than 3 months to suggest repository."
        }
        return jsonify(response), 403

    # Parse the JSON data in the request's body.
    repository_data = request.get_json()

    # Validate that the client provides all required fields.
    required_fields = ["author", "repo_name", "primary_tag"]
    for field in required_fields:
        if field not in repository_data:
            return jsonify({"message": f"{field} can't be blank."}), 400

    author = repository_data["author"].strip()
    if author == "":
        return jsonify({"message": "An author must be provided."}), 400
    repo_name = repository_data["repo_name"].strip()
    if repo_name == "":
        return jsonify({"message": "A repository name must be provided."}), 400

    # Validating Tags (input data of form: {label: "",  value:""}, which
    # is equivalent to {display_name:"", name:""})
    primary_tag = repository_data["primary_tag"]
    tags = request.json.get("tags", [])

    try:
        tags_existence = []
        # See if primary & additional tag exists
        tags_existence.append(Tag.query.filter_by(name=primary_tag["value"]).first())
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
    existing_repo = Repository.query.filter_by(id=repo_data["id"]).first()
    if existing_repo != None:
        response = {
            "message": "Repository already exists in our database.",
            "repository": existing_repo.as_dict(),
        }
        return jsonify(response), 200

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
        # Create langauge relations with repository
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
        response = {"message": "Failed to create repository associations."}
        return jsonify(response), 500

    response = {
        "message": "Successfully suggested repository.",
        "repository": Repository.query.filter_by(id=repo_data["id"]).first().as_dict(),
    }
    return jsonify(response), 200


# Route to refresh repository info from GitHub API
@bp.route("/<int:repoId>/refresh")
def refresh_repository(repoId):
    # TODO:
    # 1. Get local copy of repository & check it's last updated
    #     - If was recently updated, return local copy
    #     - If it doesn't exist locally, throw an error
    # 2. If it's allowed to be refreshed (last updated > 1 day), call
    #    GitHub API for new data.
    # 3. If doesn't exist, handle deletion protocols
    #     - Delete RepoLanguage Relations
    #     - Delete RepoTag Relations
    #     - NOTE: Probably consider whether we want to delete upvotes/downvotes
    #             and reports on this now non-existent repository as this
    #             can be abused by bad actors who have a poor upvote/downvote
    #             rating or multiple outstanding reports
    # 4. If exists, update GitHub-specific attributes in Repository Object
    #    and return it to the client

    return jsonify({"message": "Refreshed repository information.", "repository": ""})


@bp.route("/<int:repoId>", methods=["PATCH"])
def update_repository(repoId):
    return jsonify({"message": "Updated repository."})


@bp.route("/<int:repoId>", methods=["DELETE"])
def delete_repository(repoId):
    return jsonify({"message": "Delete repository."})
