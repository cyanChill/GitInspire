import os
from datetime import timedelta
from flask import Flask, Blueprint
from flask_cors import CORS


def create_app(test_config=None):
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    # NOTE: Make sure the origins matches with the frontend URL
    CORS(app, origins=["http://localhost:3000", "https://gitinspire.vercel.app"])
    app.config.from_mapping(
        SECRET_KEY="dev",
        # SQLALCHEMY_DATABASE_URI="sqlite:///gitinspire.db",
    )
    # Fix issue with unexpected server connection closure
    #  Ref: https://stackoverflow.com/a/61739721
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {"pool_pre_ping": True}
    # Have access token expire after 3 hours
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=3)

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

    # Initialize database & JWT
    from server.db import init_db
    from server.jwt import init_jwt

    init_db(app)
    init_jwt(app)

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
