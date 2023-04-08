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
            # API routes (User Age >1 year id: 0, User Age <3 Months id: 1)
            self.user_exp_token = create_access_token(identity=0)
            self.user_new_token = create_access_token(identity=1)
            self.user_admin_token = create_access_token(identity=83375816)
            self.user_owner_token = create_access_token(identity=3)

        self.app = api
        self.webtest_app = webtest.TestApp(api)
