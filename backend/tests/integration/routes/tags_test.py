import collections

from tests import testBase
from server.models.User import User


class Tags_Route_Test(testBase.TestBase):
    def assert_response(self, response, expected_tags):
        actual_names = [tag["name"] for tag in response]
        expected_names = [tag["name"] for tag in expected_tags]
        self.assertCountEqual(expected_names, actual_names)

    def test_getTags(self):
        with self.app.app_context():
            TestCase = collections.namedtuple(
                "TestCase", ["test_name", "request_url", "expected_response"]
            )

            test_cases = [
                TestCase(
                    test_name="Retrieve all tags",
                    request_url="/api/tags",
                    expected_response={
                        "primary": [
                            {
                                "name": "project_idea",
                                "display_name": "Project Idea",
                                "type": "primary",
                                "suggested_by": 0,
                            }
                        ],
                        "user_gen": [
                            {
                                "name": "frontend",
                                "display_name": "Frontend",
                                "type": "user_gen",
                                "suggested_by": 0,
                            }
                        ],
                    },
                )
            ]

            for test_case in test_cases:
                with self.subTest(msg=test_case.test_name):
                    response = self.webtest_app.get(test_case.request_url).json
                    self.assert_response(
                        response["primary"], test_case.expected_response["primary"]
                    )
                    self.assert_response(
                        response["user_gen"], test_case.expected_response["user_gen"]
                    )

    def test_createTag(self):
        with self.app.app_context():
            user = User.query.filter_by(id=0).first()

            TestCase = collections.namedtuple(
                "TestCase",
                ["test_name", "request_url", "post_data", "expected_response"],
            )

            test_cases = [
                TestCase(
                    test_name="Create tag",
                    request_url="/api/tags/create",
                    post_data={
                        "display_name": "Full Stack",
                        "type": "user_gen",
                    },
                    expected_response={
                        "display_name": "Full Stack",
                        "name": "full_stack",
                        "suggested_by": user.as_dict(),
                        "type": "user_gen",
                    },
                )
            ]

            for test_case in test_cases:
                with self.subTest(msg=test_case.test_name):
                    response = self.webtest_app.post_json(
                        test_case.request_url, test_case.post_data
                    ).json
                    # Check if "name" property & suggestor Id of Tag object is the same
                    self.assertEqual(
                        response["tag"]["name"], test_case.expected_response["name"]
                    )
                    self.assertEqual(
                        response["tag"]["suggested_by"]["id"],
                        test_case.expected_response["suggested_by"]["id"],
                    )
