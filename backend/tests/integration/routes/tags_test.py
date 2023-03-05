import collections
import pytest

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
        with self.app.app_context():
            TestCase = collections.namedtuple(
                "TestCase", ["test_name", "request_url", "expected_response"]
            )

            test_cases = [
                TestCase(
                    test_name="Retrieve all tags",
                    request_url="/api/tags",
                    expected_response={
                        "primary": [{"name": "project_idea"}],
                        "user_gen": [{"name": "frontend"}],
                    },
                )
            ]

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

    def test_createTag(self):
        with self.app.app_context():
            user = User.query.filter_by(id=0).first()

            request_body = {"display_name": "Full Stack", "type": "user_gen"}

            TestCase = collections.namedtuple(
                "TestCase", ["test_name", "expected_message"]
            )

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

            for test_case in test_cases:
                with self.subTest(msg=test_case.test_name):
                    # Send an HTTP Post Request to "/repositories" (authorization
                    # handled in TestBase class)
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

    @pytest.mark.skip(reason="Not implemented.")
    def test_create_tag_bad_request(self):
        pass

    @pytest.mark.skip(reason="Not implemented.")
    def test_update_tag(self):
        pass

    @pytest.mark.skip(reason="Not implemented.")
    def test_delete_tag(self):
        pass
