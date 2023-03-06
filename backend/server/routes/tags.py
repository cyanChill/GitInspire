from flask import Blueprint, g, jsonify, request
from flask_jwt_extended import jwt_required
import traceback

from server.db import db
from server.models.Tag import Tag, TagTypeEnum
from server.utils import serialize_sqlalchemy_objs, isXMonthOld, normalizeStr
from server.routes.auth import not_banned

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


@bp.route("/<string:tagName>", methods=["PATCH"])
def update_tag(tagName):
    return jsonify({"message": "Updated tag."})


@bp.route("/<string:tagName>", methods=["DELETE"])
def delete_tag(tagName):
    return jsonify({"message": "Deleted tag."})
