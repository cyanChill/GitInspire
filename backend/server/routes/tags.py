from flask import Blueprint, g, request, jsonify
from flask_jwt_extended import jwt_required
import traceback

from server.db import db
from server.models.Tag import Tag, TagTypeEnum
from server.utils import serialize_sqlalchemy_objs, isXMonthOld, normalizeStr
from server.routes.auth import not_banned

bp = Blueprint("tags", __name__, url_prefix="/tags")

# Route to get all tags
@bp.route("/")
def get_tags():
    primary_tags = Tag.query.filter_by(type="primary").all()
    user_gen_tags = Tag.query.filter_by(type="user_gen").all()

    return jsonify(
        {
            "primary": serialize_sqlalchemy_objs(primary_tags),
            "user_gen": serialize_sqlalchemy_objs(user_gen_tags),
        }
    )


# Route to create a tag
@bp.route("/", methods=["POST"])
@jwt_required()
@not_banned()
def create_tag():
    user = g.user.as_dict()

    if not isXMonthOld(user["github_created_at"], 12):
        return (
            jsonify(
                {
                    "message": "GitHub account age isn't old enough to suggest tag (must be older than 1 year)."
                }
            ),
            403,
        )

    # request.json.get("", default="")
    display_name = request.json.get("display_name", "").strip()
    if display_name == "":
        return jsonify({"message": "Tag input can't be empty."}), 400

    name = normalizeStr(display_name)
    type = (
        request.json.get("type", "user_gen")
        if (user["account_status"] == "owner")
        else "user_gen"
    )

    # Check if tag already exists in our database
    existing_tag = Tag.query.filter_by(name=name).first()
    if existing_tag != None:
        return (
            jsonify(
                {
                    "message": "Tag already exists in our database.",
                    "tag": existing_tag.as_dict(),
                }
            ),
            200,
        )

    try:
        new_tag = Tag(
            name=name,
            display_name=display_name,
            type=TagTypeEnum[type],
            suggested_by=user["id"],
        )
        db.session.add(new_tag)
        db.session.commit()

        return (
            jsonify({"message": "Successfully create tag.", "tag": new_tag.as_dict()}),
            200,
        )
    except:
        print(traceback.format_exc())
        return jsonify({"message": "Failed to create tag."}), 500


# Route to update a tag
@bp.route("/<string:tagName>", methods=["PATCH"])
def update_tag(tagName):
    return jsonify({"message": "Updated tag."})


# Route to delete a tag
@bp.route("/<string:tagName>", methods=["DELETE"])
def delete_tag(tagName):
    return jsonify({"message": "Delete tag."})
