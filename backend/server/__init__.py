import os
from flask import Flask


def create_app(test_config=None):
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)
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

    # Initialize database
    from server.db import init_app

    init_app(app)

    # Register our routes
    from server.routes import auth, languages, random, repositories, tags, user

    app.register_blueprint(auth.bp)
    app.register_blueprint(languages.bp)
    app.register_blueprint(random.bp)
    app.register_blueprint(repositories.bp)
    app.register_blueprint(tags.bp)
    app.register_blueprint(user.bp)

    return app
