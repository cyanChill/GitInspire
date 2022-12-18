from flask import Blueprint, g, request, jsonify, url_for

bp = Blueprint("tags", __name__, url_prefix="/tags")

# Route to get all tags
@bp.route("/")
def getTags():
  return jsonify({ "primary": [], "user-gen": [] })


# Route to create a tag
@bp.route("/create", methods=("POST"))
def createTag():
  return jsonify({ "message": "Create tag." })


# Route to update a tag
@bp.route("/<string:tag_name>/update", methods=("PATCH"))
def updateTag():
  return jsonify({ "message": "Updated tag." })


# Route to delete a tag
@bp.route("/<string:tag_name>/delete", methods=("DELETE"))
def deleteTag():
  return jsonify({ "message": "Delete tag." })
