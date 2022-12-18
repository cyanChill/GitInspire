from flask import Blueprint, g, request, jsonify, url_for

bp = Blueprint("languages", __name__, url_prefix="/languages")

# Route to get all languages
@bp.route("/")
def getLanguages():
    return jsonify({"languages": []})
