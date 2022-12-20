import os
from flask import Flask, Blueprint
from flask_cors import CORS


def create_app(test_config=None):
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    # NOTE: Make sure the origins matches with the frontend URL
    CORS(app, origins=["http://localhost:3000", "https://repot.vercel.app"])
    app.config.from_mapping(
        SECRET_KEY="dev",
        # SQLALCHEMY_DATABASE_URI="sqlite:///repot.db",
    )

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile("config.py", silent=True)
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    # Initialize database & OAuth
    from server.db import init_app
    from server.oath import init_OAuth

    init_app(app)
    init_OAuth(app)

    # Register our routes
    from server.routes import auth, languages, random, repositories, tags, user

    # Create API instance for passing blueprints
    api = Blueprint("api", __name__, url_prefix="/api")

    api.register_blueprint(auth.bp)
    api.register_blueprint(languages.bp)
    api.register_blueprint(random.bp)
    api.register_blueprint(repositories.bp)
    api.register_blueprint(tags.bp)
    api.register_blueprint(user.bp)

    app.register_blueprint(api)

    return app
