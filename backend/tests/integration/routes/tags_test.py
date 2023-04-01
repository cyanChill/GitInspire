import collections
import pytest
import webtest

from tests import testBase
from server.models.User import User


class Tags_Route_Test(testBase.TestBase):
    def assert_response(self, response, expected_tags):
        """
        A helper method that asserts whether an HTTP response includes the
        suspected Tag names
        """
        actual_names = [tag["name"] for tag in response]
        expected_names = [tag["name"] for tag in expected_tags]
        self.assertCountEqual(actual_names, expected_names)

    def test_get_tags(self):
        TestCase = collections.namedtuple(
            "TestCase", ["test_name", "request_url", "expected_response"]
        )

        test_cases = [
            TestCase(
                test_name="Retrieve all tags",
                request_url="/api/tags",
                expected_response={
                    "primary": [{"name": "project_idea"},{"name":"resource"}],
                    "user_gen": [{"name": "frontend"}],
                },
            )
        ]

        with self.app.app_context():
            for test_case in test_cases:
                with self.subTest(msg=test_case.test_name):
                    response = self.webtest_app.get(test_case.request_url).json
                    # Assert the expected and actual response size are equal.
                    self.assertEqual(
                        len(response["primary"]),
                        len(test_case.expected_response["primary"]),
                    )
                    self.assertEqual(
                        len(response["user_gen"]),
                        len(test_case.expected_response["user_gen"]),
                    )
                    # Assert the response only includes the expected Tag names
                    self.assert_response(
                        response["primary"], test_case.expected_response["primary"]
                    )
                    self.assert_response(
                        response["user_gen"], test_case.expected_response["user_gen"]
                    )

    def test_create_tag(self):
        request_body = {"display_name": "Full Stack", "type": "user_gen"}

        TestCase = collections.namedtuple("TestCase", ["test_name", "expected_message"])

        test_cases = [
            TestCase(
                test_name="Create a new tag.",
                expected_message="Successfully create tag.",
            ),
            TestCase(
                test_name="Create an existing tag.",
                expected_message="Tag already exists in our database.",
            ),
        ]

        with self.app.app_context():
            user = User.query.filter_by(id=0).first()

            for test_case in test_cases:
                with self.subTest(msg=test_case.test_name):
                    # Set authorization token to be user >1 year old
                    self.webtest_app.authorization = ("Bearer", self.user_0_token)
                    # Send an HTTP Post Request to "/tags"
                    response = self.webtest_app.post_json(
                        "/api/tags", request_body
                    ).json
                    # Assert response message
                    self.assertEqual(response["message"], test_case.expected_message)
                    # Assert various aspects of the response object
                    tag = response["tag"]
                    self.assertEqual(tag["name"], "full_stack")
                    self.assertEqual(tag["display_name"], "Full Stack")
                    self.assertEqual(tag["suggested_by"]["id"], user.as_dict()["id"])
                    self.assertEqual(tag["type"], "user_gen")

    def test_create_tag_bad_request(self):
        TestCase = collections.namedtuple(
            "TestCase",
            [
                "test_name",
                "request_body",
                "expected_error_code",
                "expected_error_message",
            ],
        )

        test_cases = [
            TestCase(
                test_name="Account is too young",
                request_body={},
                expected_error_code="403",
                expected_error_message="GitHub account age must be older than 1 year to suggest tag.",
            ),
            TestCase(
                test_name="Missing display_name",
                request_body={},
                expected_error_code="400",
                expected_error_message="display_name can\\'t be blank.",
            ),
            TestCase(
                test_name="Missing type",
                request_body={"display_name": "Full Stack"},
                expected_error_code="400",
                expected_error_message="type can\\'t be blank.",
            ),
            TestCase(
                test_name="Empty (just spaces) display_name",
                request_body={"display_name": " ", "type": "user_gen"},
                expected_error_code="400",
                expected_error_message="Tag name can\\'t be empty.",
            ),
        ]

        with self.app.app_context():
            for idx, test_case in enumerate(test_cases):
                if idx < 1:
                    # Set authorization token to be user <1 year old
                    self.webtest_app.authorization = ("Bearer", self.user_1_token)
                else:
                    # Set authorization token to be user >1 year old
                    self.webtest_app.authorization = ("Bearer", self.user_0_token)

                with self.subTest(msg=test_case.test_name):
                    # Assert validation errors are raised for the test cases defined above.
                    with self.assertRaises(webtest.AppError) as exception:
                        self.webtest_app.post_json("/api/tags", test_case.request_body)

                    # Assert the HTTP Response Code and the error messages are what we expect.
                    response_code, response_body = str(exception.exception).split("\n")
                    self.assertTrue(test_case.expected_error_code in response_code)
                    self.assertTrue(test_case.expected_error_message in response_body)

    @pytest.mark.skip(reason="Not implemented.")
    def test_update_tag(self):
        pass

    @pytest.mark.skip(reason="Not implemented.")
    def test_delete_tag(self):
        pass
