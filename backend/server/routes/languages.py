from flask import Blueprint, jsonify

from server.models.Language import Language
from server.utils import serialize_sqlalchemy_objs

bp = Blueprint("languages", __name__, url_prefix="/languages")

# Route to get all languages
@bp.route("/")
def getLanguages():
    languages = Language.query.all()
    return jsonify({"languages": serialize_sqlalchemy_objs(languages)})
