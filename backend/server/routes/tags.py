from flask import Blueprint, g, request, jsonify, url_for

from server.db import db
from server.models.Tag import Tag, TagTypeEnum
from server.utils import serialize_sqlalchemy_objs

bp = Blueprint("tags", __name__, url_prefix="/tags")

# Route to get all tags
@bp.route("/")
def getTags():
    primary_tags = Tag.query.filter_by(type="primary").all()
    user_gen_tags = Tag.query.filter_by(type="user_gen").all()

    return jsonify(
        {
            "primary": serialize_sqlalchemy_objs(primary_tags),
            "user_gen": serialize_sqlalchemy_objs(user_gen_tags),
        }
    )


# Route to create a tag
@bp.route("/create", methods=["POST"])
def createTag():
    return jsonify({"message": "Create tag."})


# Route to update a tag
@bp.route("/<string:tagName>/update", methods=["PATCH"])
def updateTag(tagName):
    return jsonify({"message": "Updated tag."})


# Route to delete a tag
@bp.route("/<string:tagName>/delete", methods=["DELETE"])
def deleteTag(tagName):
    return jsonify({"message": "Delete tag."})
