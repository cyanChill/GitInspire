from flask import Blueprint, g, jsonify, request
from flask_jwt_extended import jwt_required
from sqlalchemy import update, delete
import traceback

from server.db import db
from server.models.Tag import Tag, TagTypeEnum
from server.models.Repository import Repository, RepoTag
from server.models.Log import Log
from server.utils import serialize_sqlalchemy_objs, isXMonthOld, normalizeStr
from server.routes.auth import not_banned, admin_required

bp = Blueprint("tags", __name__, url_prefix="/tags")


@bp.route("/")
def get_tags():
    primary_tags = Tag.query.filter_by(type="primary").all()
    user_gen_tags = Tag.query.filter_by(type="user_gen").all()

    response = {
        "message": "Successfully obtained all tags.",
        "primary": serialize_sqlalchemy_objs(primary_tags),
        "user_gen": serialize_sqlalchemy_objs(user_gen_tags),
    }
    return jsonify(response), 200


@bp.route("/", methods=["POST"])
@jwt_required()
@not_banned()
def create_tag():
    # Validate that the account age of the user creating the tag is >1 year.
    user = g.user.as_dict()
    if not isXMonthOld(user["github_created_at"], 12):
        response = {
            "message": "GitHub account age must be older than 1 year to suggest tag."
        }
        return jsonify(response), 403

    # Parse the JSON data in the request's body.
    tag_data = request.get_json()

    # Validate that the client provided all required fields.
    required_fields = ["display_name", "type"]
    for field in required_fields:
        if field not in tag_data:
            return jsonify({"message": f"{field} can't be blank."}), 400

    # Other input validation checks.
    display_name = tag_data["display_name"].strip()
    if display_name == "":
        return jsonify({"message": "Tag name can't be empty."}), 400
    if len(display_name) > 25:
        return jsonify({"message": "Tag name can't be more than 25 characters."}), 400

    # Initialize and populate a Tag object.
    tag = Tag()
    tag.display_name = display_name
    tag.name = normalizeStr(display_name)
    tag.type = TagTypeEnum[
        tag_data["type"] if (user["account_status"] == "owner") else "user_gen"
    ]
    tag.suggested_by = user["id"]

    # Check if tag already exists in our database.
    existing_tag = Tag.query.filter_by(name=tag.name).first()
    if existing_tag != None:
        response = {
            "message": "Tag already exists in our database.",
            "tag": existing_tag.as_dict(),
        }
        return jsonify(response), 200

    try:
        # Add the Tag to the database and commit the transaction.
        db.session.add(tag)
        db.session.commit()

        response = {"message": "Successfully create tag.", "tag": tag.as_dict()}
        return jsonify(response), 200
    except:
        # Some unknown response has occurred.
        print(traceback.format_exc())
        return jsonify({"message": "Failed to create tag."}), 500


@bp.route("/", methods=["PATCH"])
@admin_required()
def update_tag():
    user = g.user.as_dict()

    # See if user provided a tag & tag that's being updated exists
    old_tagName = request.json.get("oldName", "").strip()
    if old_tagName == "":
        response = {"message": "You must provide the old tag name."}
        return jsonify(response), 400
    new_displayName = request.json.get("displayName", "").strip()
    if new_displayName == "":
        response = {"message": "You must provide a new tag name."}
        return jsonify(response), 400
    if len(new_displayName) > 25:
        return jsonify({"message": "Tag name can't be more than 25 characters."}), 400

    old_tag = Tag.query.filter_by(name=old_tagName).first()
    if old_tag == None:
        response = {"message": "Tag no longer exists in the database."}
        return jsonify(response), 400
    if normalizeStr(new_displayName) == old_tag.name:
        response = {
            "message": "Tag name has not been changed.",
            "tag": old_tag.as_dict(),
        }
        return jsonify(response), 400
    # Check if person has permissions to update tag (ie: admin can't edit primary tags)
    if old_tag.type.name == "primary" and user["account_status"] != "owner":
        response = {
            "message": "You don't have permission to update this tag.",
            "tag": old_tag.as_dict(),
        }
        return jsonify(response), 401

    # Checks to see if tag exists with new name
    existing_tag = Tag.query.filter_by(name=normalizeStr(new_displayName)).first()
    if existing_tag != None:
        response = {
            "message": "New tag name already exists.",
            "tag": existing_tag.as_dict(),
        }
        return jsonify(response), 400

    try:
        # Now guaranteed a new tag name
        new_tag = Tag(
            display_name=new_displayName,
            name=normalizeStr(new_displayName),
            type=old_tag.type.name,
            suggested_by=old_tag.user.id,
        )
        db.session.add(new_tag)
        db.session.commit()

        # Update all entries that used the old tag
        update_stmt = None
        if old_tag.type.name == "user_gen":
            update_stmt = (
                update(RepoTag)
                .where(RepoTag.tag_name == old_tag.name)
                .values(tag_name=new_tag.name)
            )
        elif old_tag.type.name == "primary":
            update_stmt = (
                update(Repository)
                .where(Repository._primary_tag == old_tag.name)
                .values(_primary_tag=new_tag.name)
            )
        db.session.execute(update_stmt)
        db.session.commit()

        # Delete old tag
        delete_stmt = delete(Tag).where(Tag.name == old_tag.name)
        db.session.execute(delete_stmt)
        db.session.commit()

        # Log the update action
        log = Log(
            action=f"update ({old_tag.name} -> {new_tag.name})",
            type="tag",
            content_id=new_tag.name,
            enacted_by=user["id"],
        )
        try:
            # Make sure ids sequence value is correct (help prevent creating record w/ duplicate id for Postgresql Database)
            #   - Ref: https://stackoverflow.com/a/37972960
            db.session.execute(
                "SELECT setval(pg_get_serial_sequence('logs', 'id'), coalesce(max(id)+1, 1), false) FROM logs"
            )
        except:
            pass
        db.session.add(log)
        db.session.commit()

        response = {
            "message": "Successfully updated tag.",
            "tag": new_tag.as_dict(),
        }
        return jsonify(response), 200
    except:
        print(traceback.format_exc())
        response = {"message": "Something went wrong with updating tag."}
        return jsonify(response), 500


@bp.route("/<string:tagName>", methods=["DELETE"])
@admin_required()
def delete_tag(tagName):
    return jsonify({"message": "Deleted tag."})
