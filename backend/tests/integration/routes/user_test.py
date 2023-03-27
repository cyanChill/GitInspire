import collections
import pytest
import webtest
from datetime import datetime

from tests import testBase
from server.db import db
from server.models.User import User, AccountStatusEnum


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
                request_url="/api/users/0",
                expected_res={
                    "message": "User found.",
                    "user_exerpt": {"id": 0},
                    "contributions": {"suggested_tags": 3, "suggested_repos": 3},
                },
            ),
            TestCase(
                test_name="Get specific user (that doesn't exists)",
                request_url="/api/users/23423423",
                expected_res={
                    "message": "User not found.",
                    "user_exerpt": None,
                    "contributions": None,
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
                    usr_contribs = response["contributions"]
                    expected_usr = test_case.expected_res["user_exerpt"]
                    expected_contribs = test_case.expected_res["contributions"]

                    if usr != None:  # User found
                        # Assert the response only includes the expected User ids
                        self.assert_response([usr], [expected_usr])
                        self.assertTrue(
                            len(usr_contribs["suggested_tags"]),
                            expected_contribs["suggested_tags"],
                        )
                        self.assertTrue(
                            len(usr_contribs["suggested_repos"]),
                            expected_contribs["suggested_repos"],
                        )
                    else:  # User not found
                        self.assertTrue(expected_usr == None)

    def test_refresh_user(self):
        TestCase = collections.namedtuple(
            "TestCase", ["test_name", "user_id", "expected_res"]
        )

        with self.app.app_context():
            recent_user = User(
                id=50,
                username="recentUser",
                avatar_url="https://avatars.githubusercontent.com/u/83375816?v=4",
                github_created_at=datetime.strptime(
                    "2021-04-28T21:49:19Z", "%Y-%m-%dT%H:%M:%SZ"
                ),
                account_status=AccountStatusEnum["user"],
            )
            # Add recent repo
            db.session.add(recent_user)
            db.session.commit()

            user_1 = User.query.filter_by(id=83375816).first()
            user_1_dict = user_1.as_dict()
            currDate = datetime.utcnow()
            user_1_dict["last_updated"] = currDate

            test_cases = [
                TestCase(
                    test_name="Refreshing user recently refreshed",
                    user_id="50",
                    expected_res={
                        "message": "User has been recently updated.",
                        "user": recent_user.as_dict(),
                    },
                ),
                TestCase(
                    test_name="Refreshing user with refreshable content.",
                    user_id="83375816",
                    expected_res={
                        "message": "Refreshed user information.",
                        "user": user_1_dict,
                    },
                ),
            ]

            for test_case in test_cases:
                with self.subTest(msg=test_case.test_name):
                    response = self.webtest_app.get(
                        f"/api/users/{test_case.user_id}/refresh"
                    ).json

                    self.assertEqual(
                        response["message"], test_case.expected_res["message"]
                    )

                    user = response["user"]
                    expected_user = test_case.expected_res["user"]
                    # Check username equivalence
                    self.assertEqual(user["username"], expected_user["username"])

                    # Deal with last_updated property check
                    repo_date_1 = datetime.strptime(
                        user["last_updated"], "%Y-%m-%dT%H:%M:%S"
                    )
                    self.assertEqual(repo_date_1.month, currDate.month)
                    self.assertEqual(repo_date_1.day, currDate.day)
                    self.assertEqual(repo_date_1.year, currDate.year)

    def test_refresh_user_bad_request(self):
        TestCase = collections.namedtuple(
            "TestCase",
            [
                "test_name",
                "user_id",
                "expected_error_code",
                "expected_error_message",
            ],
        )

        test_cases = [
            TestCase(
                test_name="User doesn't exist in our database",
                user_id="100",
                expected_error_code="404",
                expected_error_message="User with user id 100 doesn\\'t exist.",
            ),
            TestCase(
                test_name="User that doesn't exist in the GitHub API",
                user_id="0",
                expected_error_code="410",
                expected_error_message="User is no longer accessible via the GitHub API.",
            ),
        ]

        with self.app.app_context():
            for test_case in test_cases:
                with self.subTest(msg=test_case.test_name):
                    # Assert validation errors are raised for the test cases defined above.
                    with self.assertRaises(webtest.AppError) as exception:
                        self.webtest_app.get(f"/api/users/{test_case.user_id}/refresh")

                    # Assert the HTTP Response Code and the error messages are what we expect.
                    response_code, response_body = str(exception.exception).split("\n")
                    self.assertTrue(test_case.expected_error_code in response_code)
                    self.assertTrue(test_case.expected_error_message in response_body)

    @pytest.mark.skip(reason="Not implemented.")
    def test_delete_user(self):
        pass
