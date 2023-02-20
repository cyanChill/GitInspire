import os

baseDir = os.path.abspath(os.path.dirname(__file__))

# Handling configurations for different environments by overriding base values.
#  - https://flask.palletsprojects.com/en/2.2.x/config/#development-production


class Configuration:
    pass


class ConfigurationName:
    DEVELOPMENT = "development"
    PRODUCTION = "production"
    TESTING = "testing"


class DevelopmentConfiguration(Configuration):
    def __init__(self, app):
        pass

    DEBUG = True
    JWT_COOKIE_SECURE = False

    # Override SQLALCHEMY_DATABASE_URI in "instance/config.py" which contains
    # production DATABASE URI
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DEV_DATABASE_URL"
    ) or "sqlite:///" + os.path.join(baseDir, "gitinspire-dev.db")


class ProductionConfiguration(Configuration):
    def __init__(self, app):
        self.clientId = app.config["PROD_GITHUB_CLIENT_ID"]
        self.clientSecret = app.config["PROD_GITHUB_CLIENT_ID"]

    JWT_COOKIE_SECURE = True  # Should be set to True in production

    # Fetch values from "instance/config.py" for production values
    @property
    def GITHUB_CLIENT_ID(self):
        return self.clientId

    @property
    def GITHUB_CLIENT_SECRET(self):
        return self.clientSecret


class TestingConfiguration(Configuration):
    def __init__(self, app):
        pass

    TESTING = True
    JWT_COOKIE_SECURE = False
    JWT_COOKIE_CSRF_PROTECT = False
    JWT_TOKEN_LOCATION = 'headers'

    # Override SQLALCHEMY_DATABASE_URI in "instance/config.py" which contains
    # production DATABASE URI
    SQLALCHEMY_DATABASE_URI = os.environ.get("TEST_DATABASE_URL") or "sqlite:///"


configuration = {
    ConfigurationName.DEVELOPMENT: DevelopmentConfiguration,
    ConfigurationName.PRODUCTION: ProductionConfiguration,
    ConfigurationName.TESTING: TestingConfiguration,
}
