import unittest
import webtest
from flask_jwt_extended import create_access_token

from server import create_app
import server.configuration as configuration

# Ref: https://flask.palletsprojects.com/en/2.2.x/tutorial/tests/


class TestBase(unittest.TestCase):
    def setUp(self):
        super(TestBase, self).setUp()

        api = create_app(configuration.ConfigurationName.TESTING)

        # Set up dummy database values
        with api.app_context():
            from server.db import db
            from tests.gen_data import gen_dummyData

            # Get array of dummy data & commit to dummy database
            data = gen_dummyData()
            for entry in data:
                db.session.add(entry)
            db.session.commit()

            # Generate fake user credentials for accessing protected
            # API routes (Dummy user account id: 0)
            jwt_access_token = create_access_token(identity=0)

        self.app = api
        self.webtest_app = webtest.TestApp(api)
        # Set authorization header to access token to access protected routes
        self.webtest_app.authorization = ("Bearer", jwt_access_token)
