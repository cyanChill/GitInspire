import os
from datetime import timedelta
from flask import Flask, Blueprint
from flask_cors import CORS
from datetime import datetime

import server.configuration as configuration


def create_app(configName=None):
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    # NOTE: Make sure the origins matches with the frontend URL
    CORS(app, origins=["http://localhost:3000", "https://gitinspire.vercel.app"])

    # Load configs to override production values if provided
    configName = (
        configName
        if configName
        else os.environ.get("ENVIRONMENT", configuration.ConfigurationName.DEVELOPMENT)
    )

    app.config.from_object(configuration.configuration[configName])

    app.config.update(
        SECRET_KEY=os.environ.get("SECRET_KEY", "dev"),
        JWT_SECRET_KEY=os.environ.get("JWT_SECRET_KEY", "dev"),
        # Fix issue with unexpected server connection closure
        #  Ref: https://stackoverflow.com/a/61739721
        SQLALCHEMY_ENGINE_OPTIONS={"pool_pre_ping": True},
        # Have access token expire after 3 hours
        JWT_ACCESS_TOKEN_EXPIRES=timedelta(hours=3),
    )

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
    from server.routes import (
        auth,
        languages,
        random,
        repositories,
        tags,
        user,
        report,
        log,
    )

    # Disable redirecting to URL with trailing slash when visiting URL
    # without trailing slash
    app.url_map.strict_slashes = False
    # Create API instance for passing blueprints
    api = Blueprint("api", __name__, url_prefix="/api")

    api.register_blueprint(auth.bp)
    api.register_blueprint(languages.bp)
    api.register_blueprint(random.bp)
    api.register_blueprint(repositories.bp)
    api.register_blueprint(tags.bp)
    api.register_blueprint(user.bp)
    api.register_blueprint(report.bp)
    api.register_blueprint(log.bp)

    app.register_blueprint(api)

    with app.app_context():
        from server.db import db
        from server.models.User import User, AccountStatusEnum

        # Create a bot account if it doesn't exist
        bot_account = User.query.filter_by(id="-1337").first()
        if bot_account == None:
            bot_account = User(
                id="-1337",
                username="GitInspire_Bot",
                avatar_url="",
                github_created_at=datetime.strptime(
                    datetime.strftime(datetime.now(), "%Y-%m-%dT%H:%M:%SZ"),
                    "%Y-%m-%dT%H:%M:%SZ",
                ),
                account_status=AccountStatusEnum["bot"],
            )
            db.session.add(bot_account)
            db.session.commit()

    return app
