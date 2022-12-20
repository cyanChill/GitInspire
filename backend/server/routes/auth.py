from flask import Blueprint, g, request, jsonify, url_for, redirect

from server.oath import oauth

bp = Blueprint("auth", __name__, url_prefix="/auth")

# Runs before the view function
@bp.before_app_request
def load_logged_in_user():
    g.__extraRequestdata__ = "Basically ExpressJS's app.use()"


@bp.route("/login")
def login():
    # TODO: For connection with the frontend, probably should provide a
    # redirect query parameter and pass it into the redirect_uri
    redirect_uri = url_for("api.auth.authorize", _external=True)
    return oauth.github.authorize_redirect(redirect_uri)


@bp.route("/authorize")
def authorize():
    token = oauth.github.authorize_access_token()
    resp = oauth.github.get("user", token=token)
    resp.raise_for_status()
    profile = resp.json()

    # Do something with token and profile
    # print(token)
    print(profile)

    return jsonify({"message": "Successfully logged in."})

    # Redirect to the frontend
    return redirect("https://cyanchill.netlify.app/")


@bp.route("/logout")
def logout():
    return jsonify({"message": "Pinged /logout"})
