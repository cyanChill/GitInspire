from flask import Blueprint, g, jsonify, request, current_app as app
from flask_jwt_extended import jwt_required
from sqlalchemy import delete, update, text
import requests
from math import ceil
import traceback
import validators

from server.utils import (
    isXDayOld,
    isXMonthOld,
    filterLangs,
    normalizeStr,
    serialize_sqlalchemy_objs,
)
from server.routes.auth import not_banned, admin_required
from server.db import db
from server.models.Language import Language
from server.models.Tag import Tag
from server.models.Log import Log
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
    page = request.args.get("page", default=1, type=int)
    if page != None and page < 1:
        page = 1
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

    # Sorting Filters [default newest suggested repositories first]
    sortOpts = ["stars", "date"]
    sort = request.args.get("sort", type=str)
    sort = sort if sort in sortOpts else None

    order = request.args.get("order", default="asc", type=str)
    order = "desc" if order == "desc" else "asc"

    # Create query & apply filters
    query = Repository.query
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
    if sort == "date":
        if order == "desc":
            query = query.order_by(Repository.last_updated.desc())
        else:
            query = query.order_by(Repository.last_updated)

    # How to deal with getting results after "skipping" (offset)
    # https://stackoverflow.com/q/52803570

    # To also return number of remaining pages - counting number of
    # possible remaining entries (for pagnation purposes)
    # https://stackoverflow.com/q/10822635
    try:
        numEntries = query.count()
        results = query.offset((page - 1) * limit).limit(limit).all()

        response = {
            "message": "Found results.",
            "currPage": page if numEntries != 0 else 0,
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
    repo_dt_resp = requests.get(
        f"https://api.github.com/repos/{author}/{repo_name}",
        auth=(app.config["GITHUB_CLIENT_ID"], app.config["GITHUB_CLIENT_SECRET"]),
        headers={
            "Accept": "application/vnd.github.text-match+json",
            "User-Agent": "gitinspire-server",
        },
    )
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
    repo_lang_dt_resp = requests.get(
        repo_data["languages_url"],
        auth=(app.config["GITHUB_CLIENT_ID"], app.config["GITHUB_CLIENT_SECRET"]),
        headers={
            "Accept": "application/vnd.github.text-match+json",
            "User-Agent": "gitinspire-server",
        },
    )
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
    # Get local copy of repository & check it hasn't been updated in the last day
    existing_repo = Repository.query.filter_by(id=repoId).first()
    if existing_repo == None:
        response = {"message": f"Repository with repository id {repoId} doesn't exist."}
        return jsonify(response), 404

    if not isXDayOld(existing_repo.last_updated, 1):
        response = {
            "message": "Repository has been recently updated.",
            "repository": existing_repo.as_dict(),
        }
        return jsonify(response), 200

    # Call GitHub API since repository data can be refreshed
    repo_data_resp = requests.get(
        f"https://api.github.com/repositories/{repoId}",
        auth=(app.config["GITHUB_CLIENT_ID"], app.config["GITHUB_CLIENT_SECRET"]),
        headers={
            "Accept": "application/vnd.github.text-match+json",
            "User-Agent": "gitinspire-server",
        },
    )

    # Handle case where rate limit was hit, validation failed, endpoint has been spammed
    if repo_data_resp.status_code in [403, 422]:
        response = {
            "message": "Rate limit was hit, validation failed, or endpoint has been spammed."
        }
        return jsonify(response), 500

    # Handle case where repository is no longer accessible via the API
    if repo_data_resp.status_code == 404:
        # Delete all SQL objects containing a relation with specified "repoId"
        db.session.execute(delete(RepoLanguage).where(RepoLanguage.repo_id == repoId))
        db.session.execute(delete(RepoTag).where(RepoTag.repo_id == repoId))
        db.session.execute(delete(Repository).where(Repository.id == repoId))
        db.session.commit()

        # Log the automatic deletion
        log = Log(
            action=f"delete (auto)",
            type="repository",
            content_id=repoId,
            enacted_by="-1337",  # Bot user id
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
            "message": "Repository is no longer accessible via the GitHub API and has been deleted from our database."
        }
        return jsonify(response), 410

    # Handle case where no modifications was made
    if repo_data_resp.status_code == 304:
        # "Touch" Repository entry to trigger onupdate event to update "last_update"
        stmt = update(Repository).where(Repository.id == repoId)
        db.engine.execute(stmt)
        response = {
            "message": "No changes was found.",
            "repository": existing_repo.as_dict(),
        }
        return jsonify(response), 200

    # Some other untracked error
    if not repo_data_resp.ok:
        return jsonify({"message": "An unknown error has occurred."}), 500

    # Handling case where modifications were made
    updt_repo_data = repo_data_resp.json()
    update_dict = {
        "author": updt_repo_data["owner"]["login"],
        "repo_name": updt_repo_data["name"],
        "description": updt_repo_data["description"],
        "stars": updt_repo_data["stargazers_count"],
    }

    try:
        # Commiting update
        update_stmt = update(Repository).filter_by(id=repoId).values(**update_dict)
        db.session.execute(update_stmt)
        db.session.commit()
    except:
        print(traceback.format_exc())
        response = {"message": "Something went wrong with refreshing repository data."}
        return jsonify(response), 500

    # Updating languages if that has changed
    updt_langs_resp = requests.get(
        updt_repo_data["languages_url"],
        auth=(app.config["GITHUB_CLIENT_ID"], app.config["GITHUB_CLIENT_SECRET"]),
        headers={
            "Accept": "application/vnd.github.text-match+json",
            "User-Agent": "gitinspire-server",
        },
    )
    updt_langs = updt_langs_resp.json()
    if not updt_langs_resp.ok:
        return jsonify({"message": "Failed to find repository languages."}), 500

    sorted_langs = filterLangs(updt_langs)
    # Add languages to database if they don't exist
    for lg in sorted_langs:
        if Language.query.filter_by(name=normalizeStr(lg)).first() == None:
            new_lang = Language(name=normalizeStr(lg), display_name=lg)
            db.session.add(new_lang)
    db.session.commit()

    try:
        # Delete previous language relations
        del_stmt = delete(RepoLanguage).where(RepoLanguage.repo_id == repoId)
        db.session.execute(del_stmt)
        db.session.commit()

        # Add the updated langauge relations with repository
        if sorted_langs:
            for idx, lg in enumerate(sorted_langs):
                new_lang_rel = RepoLanguage(
                    repo_id=repoId,
                    language_name=normalizeStr(lg),
                    is_primary=(idx == 0),
                )
                db.session.add(new_lang_rel)
        db.session.commit()
    except:
        print(traceback.format_exc())
        response = {"message": "Failed to update repository associations."}
        return jsonify(response), 500

    response = {
        "message": "Refreshed repository information.",
        "repository": existing_repo.as_dict(),
    }
    return jsonify(response), 200


@bp.route("/<int:repoId>", methods=["PATCH"])
@admin_required()
def update_repository(repoId):
    user = g.user.as_dict()

    # Check if repository still exists in our database
    existing_repo = Repository.query.filter_by(id=repoId).first()
    if existing_repo == None:
        response = {"message": "Repository no longer exists in the database."}
        return jsonify(response), 400

    primary_tag = request.json.get("primary_tag", None)
    tags = request.json.get("tags", [])
    maintain_link = request.json.get("maintain_link", "")

    if not primary_tag:
        response = {"message": "You must provide a primary tag."}
        return jsonify(response), 400

    try:
        if maintain_link != "" and not validators.url(maintain_link, public=True):
            response = {
                "message": "Maintain URL is not in a valid format (valid is: https://.*)."
            }
            return jsonify(response), 400
    except:
        # Reach here if a "ValidationError" is thrown
        response = {
            "message": "Maintain URL is not in a valid format (valid is: https://.*)."
        }
        return jsonify(response), 400

    # Validation of tags
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

    try:
        action_msg = (
            "update (maintain link)"
            if maintain_link != "" and maintain_link != existing_repo.maintain_link
            else "update"
        )

        # Update primary tag
        update_stmt = (
            update(Repository)
            .filter_by(id=repoId)
            .values(_primary_tag=primary_tag["value"], maintain_link=maintain_link)
        )
        db.session.execute(update_stmt)
        db.session.commit()

        # Update tags
        delete_stmt = delete(RepoTag).where(RepoTag.repo_id == repoId)
        db.session.execute(delete_stmt)
        db.session.commit()

        # Add the updated tags relations with repository
        if tags:
            for tag in tags:
                new_tag_rel = RepoTag(
                    repo_id=repoId,
                    tag_name=normalizeStr(tag["value"]),
                )
                db.session.add(new_tag_rel)
        db.session.commit()

        # Log the update action
        log = Log(
            action=action_msg,
            type="repository",
            content_id=repoId,
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
            "message": "Successfully updated repository.",
            "repository": existing_repo.as_dict(),
        }
        return jsonify(response), 200
    except:
        print(traceback.format_exc())
        response = {"message": "Something went wrong with updating repository."}
        return jsonify(response), 500


@bp.route("/<int:repoId>", methods=["DELETE"])
@admin_required()
def delete_repository(repoId):
    user = g.user.as_dict()

    # Check if repository still exists in our database
    existing_repo = Repository.query.filter_by(id=repoId).first()
    if existing_repo == None:
        response = {"message": "Repository no longer exists in the database."}
        return jsonify(response), 400

    # Proceed with delete process
    try:
        delete_stmt1 = delete(RepoTag).where(RepoTag.repo_id == repoId)
        delete_stmt2 = delete(RepoLanguage).where(RepoLanguage.repo_id == repoId)
        delete_stmt3 = delete(Repository).where(Repository.id == repoId)
        db.session.execute(delete_stmt1)
        db.session.execute(delete_stmt2)
        db.session.execute(delete_stmt3)
        db.session.commit()

        # Log the delete action
        log = Log(
            action="delete",
            type="repository",
            content_id=repoId,
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

        response = {"message": "Successfully delete old repository."}
        return jsonify(response), 200
    except:
        print(traceback.format_exc())
        response = {"message": "Something went wrong with updating repository."}
        return jsonify(response), 500
