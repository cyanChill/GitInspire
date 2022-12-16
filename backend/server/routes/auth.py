from flask import Blueprint, g, request, url_for

bp = Blueprint("auth", __name__, url_prefix="/auth")

# Runs before the view function
@bp.before_app_request
def load_logged_in_user():
    g.__extraRequestdata__ = "Basically ExpressJS's app.use()"


@bp.route("/login", methods=("GET", "POST"))
def login():
    pass


@bp.route("/logout")
def logout():
    pass
