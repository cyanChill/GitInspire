from flask import Blueprint, jsonify

from server.models.Language import Language
from server.utils import serialize_sqlalchemy_objs

bp = Blueprint("languages", __name__, url_prefix="/languages")


@bp.route("/")
def get_languages():
    languages = Language.query.all()

    response = {
        "message": "Successfully obtained all languages.",
        "languages": serialize_sqlalchemy_objs(languages),
    }
    return jsonify(response), 200
