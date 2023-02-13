import os
from datetime import timedelta
from flask import Flask, Blueprint
from flask_cors import CORS

import server.configuration as configuration


def create_app(configName=None):
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    # NOTE: Make sure the origins matches with the frontend URL
    CORS(app, origins=["http://localhost:3000", "https://gitinspire.vercel.app"])

    # Fix issue with unexpected server connection closure
    #  Ref: https://stackoverflow.com/a/61739721
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {"pool_pre_ping": True}
    # Have access token expire after 3 hours
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=3)

    # load the default config values
    app.config.from_pyfile("config.py", silent=True)

    # Load configs to override production values if provided
    if configName is not None:
        app.config.from_object(configuration.configuration[configName](app))

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
