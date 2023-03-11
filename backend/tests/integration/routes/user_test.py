import collections
import pytest
import webtest

from tests import testBase
from server.models.User import User


class User_Route_Test(testBase.TestBase):
    def assert_response(self, response, expected_users):
        """
        A helper method that asserts whether an HTTP response includes the
        suspected User ids
        """
        actual_ids = [usr["id"] for usr in response]
        expected_ids = [usr["id"] for usr in expected_users]
        self.assertCountEqual(actual_ids, expected_ids)

    def test_get_user(self):
        TestCase = collections.namedtuple(
            "TestCase", ["test_name", "request_url", "expected_res"]
        )

        test_cases = [
            TestCase(
                test_name="Get specific user (that exists)",
                request_url="/api/user/0",
                expected_res={
                    "message": "User found.",
                    "user_exerpt": {"id": 0},
                },
            ),
            TestCase(
                test_name="Get specific user (that doesn't exists)",
                request_url="/api/user/23423423",
                expected_res={
                    "message": "User not found.",
                    "user_exerpt": None,
                },
            ),
        ]

        with self.app.app_context():
            for test_case in test_cases:
                with self.subTest(msg=test_case.test_name):
                    response = self.webtest_app.get(test_case.request_url).json
                    self.assertEqual(
                        response["message"], test_case.expected_res["message"]
                    )

                    usr = response["user"]
                    expected_usr = test_case.expected_res["user_exerpt"]

                    if usr != None:  # User found
                        # Assert the response only includes the expected User ids
                        self.assert_response([usr], [expected_usr])
                    else:  # User not found
                        self.assertTrue(expected_usr == None)

    @pytest.mark.skip(reason="Not implemented.")
    def test_get_users(self):
        pass

    @pytest.mark.skip(reason="Not implemented.")
    def test_refresh_user(self):
        pass
    
    @pytest.mark.skip(reason="Not implemented.")
    def test_get_user_contributions(self):
        pass
    
    @pytest.mark.skip(reason="Not implemented.")
    def test_delete_user(self):
        pass
