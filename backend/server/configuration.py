import os
from dotenv import load_dotenv

# Get the path to the directory this file is in
BASEDIR = os.path.abspath(os.path.dirname(__file__))
# Connect the path with your '.env' file name
load_dotenv(os.path.join(BASEDIR, ".env"))

# Handling configurations for different environments by overriding base values.
#  - https://flask.palletsprojects.com/en/2.2.x/config/#development-production


class Configuration:
    pass


class ConfigurationName:
    DEVELOPMENT = "development"
    PRODUCTION = "production"
    TESTING = "testing"


class DevelopmentConfiguration(Configuration):
    def __init__(self):
        pass

    DEBUG = True

    JWT_COOKIE_SECURE = False
    JWT_TOKEN_LOCATION = "cookies"

    GITHUB_CLIENT_ID = os.environ.get("DEV_GITHUB_CLIENT_ID", "")
    GITHUB_CLIENT_SECRET = os.environ.get("DEV_GITHUB_CLIENT_SECRET", "")
    GITHUB_REDIRECT_URI = "http://localhost:3000/auth/login"

    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DEV_DATABASE_URL", "sqlite:///" + os.path.join(BASEDIR, "gitinspire-dev.db")
    )


class ProductionConfiguration(Configuration):
    def __init__(self):
        pass

    JWT_COOKIE_SECURE = True  # Should be set to True in production
    JWT_TOKEN_LOCATION = "cookies"

    # Fetch values from "instance/config.py" for production values
    GITHUB_CLIENT_ID = os.environ.get("PROD_GITHUB_CLIENT_ID", "")
    GITHUB_CLIENT_SECRET = os.environ.get("PROD_GITHUB_CLIENT_SECRET", "")
    GITHUB_REDIRECT_URI = "https://gitinspire.vercel.app/auth/login"

    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "PROD_DATABASE_URL", "sqlite:///" + os.path.join(BASEDIR, "gitinspire.db")
    )


class TestingConfiguration(Configuration):
    def __init__(self):
        pass

    TESTING = True

    JWT_COOKIE_SECURE = False
    JWT_COOKIE_CSRF_PROTECT = False
    JWT_TOKEN_LOCATION = "headers"

    GITHUB_CLIENT_ID = os.environ.get("DEV_GITHUB_CLIENT_ID", "")
    GITHUB_CLIENT_SECRET = os.environ.get("DEV_GITHUB_CLIENT_SECRET", "")
    GITHUB_REDIRECT_URI = "http://localhost:3000/auth/login"

    SQLALCHEMY_DATABASE_URI = os.environ.get("TEST_DATABASE_URL", "sqlite:///")


configuration = {
    ConfigurationName.DEVELOPMENT: DevelopmentConfiguration,
    ConfigurationName.PRODUCTION: ProductionConfiguration,
    ConfigurationName.TESTING: TestingConfiguration,
}
