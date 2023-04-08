import collections
import pytest
import webtest

from tests import testBase
from server.models.User import User
from server.models.Repository import Repository, RepoTag
from server.models.Tag import Tag


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
                    "primary": [{"name": "project_idea"}, {"name": "resource"}],
                    "user_gen": [{"name": "frontend"}, {"name": "machine_learning"}],
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
                # Set authorization token to be user >1 year old
                self.webtest_app.authorization = ("Bearer", self.user_exp_token)

                with self.subTest(msg=test_case.test_name):
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
            TestCase(
                test_name="Display name > 25 characters",
                request_body={
                    "display_name": "Lorem ipsum dolor sit amet",
                    "type": "user_gen",
                },
                expected_error_code="400",
                expected_error_message="Tag name can\\'t be more than 25 characters.",
            ),
        ]

        with self.app.app_context():
            for idx, test_case in enumerate(test_cases):
                if idx < 1:
                    # Set authorization token to be user <1 year old
                    self.webtest_app.authorization = ("Bearer", self.user_new_token)
                else:
                    # Set authorization token to be user >1 year old
                    self.webtest_app.authorization = ("Bearer", self.user_exp_token)

                with self.subTest(msg=test_case.test_name):
                    # Assert validation errors are raised for the test cases defined above.
                    with self.assertRaises(webtest.AppError) as exception:
                        self.webtest_app.post_json("/api/tags", test_case.request_body)

                    # Assert the HTTP Response Code and the error messages are what we expect.
                    response_code, response_body = str(exception.exception).split("\n")
                    self.assertTrue(test_case.expected_error_code in response_code)
                    self.assertTrue(test_case.expected_error_message in response_body)

    def test_update_tag(self):
        with self.app.app_context():
            # Updating a "user-gen" tag as an Admin user
            self.webtest_app.authorization = ("Bearer", self.user_admin_token)
            response = self.webtest_app.patch_json(
                "/api/tags",
                {"oldName": "frontend", "newDisplayName": "Web Development"},
            ).json
            self.assertEqual(response["message"], "Successfully updated tag.")
            self.assertEqual(response["tag"]["name"], "web_development")
            updated_repoTags = RepoTag.query.filter_by(tag_name="web_development").all()
            self.assertEqual(len(updated_repoTags), 2)

            # Updating a "primary" tag as an Owner user
            self.webtest_app.authorization = ("Bearer", self.user_owner_token)
            response = self.webtest_app.patch_json(
                "/api/tags",
                {"oldName": "resource", "newDisplayName": "Reference Material"},
            ).json
            self.assertEqual(response["message"], "Successfully updated tag.")
            self.assertEqual(response["tag"]["name"], "reference_material")
            updated_repos = Repository.query.filter_by(
                _primary_tag="reference_material"
            ).all()
            self.assertEqual(len(updated_repos), 2)

    def test_update_tag_bad_request(self):
        TestCase = collections.namedtuple(
            "TestCase",
            [
                "test_name",
                "request_body",
                "expected_error_code",
                "expected_error_message",
            ],
        )

        user_test_cases = [
            TestCase(
                test_name="User unauthorized access",
                request_body={},
                expected_error_code="403",
                expected_error_message="Admin only.",
            ),
        ]

        admin_test_cases = [
            TestCase(
                test_name="Didn't provide old tag name",
                request_body={},
                expected_error_code="400",
                expected_error_message="You must provide the old tag name.",
            ),
            TestCase(
                test_name="Didn't provide new tag display name",
                request_body={"oldName": "fake_tag"},
                expected_error_code="400",
                expected_error_message="You must provide a new tag name.",
            ),
            TestCase(
                test_name="New tag display name is > 25 characters",
                request_body={
                    "oldName": "fake_tag",
                    "newDisplayName": "Lorem ipsum dolor sit amet",
                },
                expected_error_code="400",
                expected_error_message="Tag name can\\'t be more than 25 characters.",
            ),
            TestCase(
                test_name="Tag we're updating doesn't exist",
                request_body={"oldName": "fake_tag", "newDisplayName": "New Tag"},
                expected_error_code="400",
                expected_error_message="Tag no longer exists in the database.",
            ),
            TestCase(
                test_name="New tag name hasn't changed",
                request_body={"oldName": "frontend", "newDisplayName": "Frontend"},
                expected_error_code="400",
                expected_error_message="Tag name has not been changed.",
            ),
            TestCase(
                test_name="Admin user can't update primary-type tag",
                request_body={"oldName": "resource", "newDisplayName": "Frontend"},
                expected_error_code="401",
                expected_error_message="You don\\'t have permission to update this tag.",
            ),
            TestCase(
                test_name="New tag name already exists",
                request_body={
                    "oldName": "frontend",
                    "newDisplayName": "Machine Learning",
                },
                expected_error_code="400",
                expected_error_message="New tag name already exists.",
            ),
        ]

        all_test_cases = [user_test_cases, admin_test_cases]

        with self.app.app_context():
            for idx, test_cases in enumerate(all_test_cases):
                if idx < 1:
                    self.webtest_app.authorization = ("Bearer", self.user_new_token)
                else:
                    self.webtest_app.authorization = ("Bearer", self.user_admin_token)

                for test_case in test_cases:
                    with self.subTest(msg=test_case.test_name):
                        # Assert validation errors are raised for the test cases defined above.
                        with self.assertRaises(webtest.AppError) as exception:
                            self.webtest_app.patch_json(
                                "/api/tags", test_case.request_body
                            )

                        # Assert the HTTP Response Code and the error messages are what we expect.
                        res_code, res_body = str(exception.exception).split("\n")
                        self.assertTrue(test_case.expected_error_code in res_code)
                        self.assertTrue(test_case.expected_error_message in res_body)

    def test_delete_tag(self):
        with self.app.app_context():
            # Deleting a "user-gen" tag as an Admin user
            self.webtest_app.authorization = ("Bearer", self.user_admin_token)
            response = self.webtest_app.put_json(
                "/api/tags", {"oldTagName": "frontend"}
            ).json
            self.assertEqual(response["message"], "Successfully delete old tag.")
            frontend_tag = Tag.query.filter_by(name="frontend").first()
            self.assertTrue(frontend_tag == None)

            # Deleting a "primary" tag as an Owner user
            self.webtest_app.authorization = ("Bearer", self.user_owner_token)
            response = self.webtest_app.put_json(
                "/api/tags",
                {"oldTagName": "resource", "replacementTagName": "project_idea"},
            ).json
            self.assertEqual(response["message"], "Successfully delete old tag.")
            updated_repos = Repository.query.filter_by(
                _primary_tag="project_idea"
            ).all()
            self.assertEqual(len(updated_repos), 3)

    @pytest.mark.skip(reason="Not implemented.")
    def test_delete_tag_bad_request(self):
        TestCase = collections.namedtuple(
            "TestCase",
            [
                "test_name",
                "request_body",
                "expected_error_code",
                "expected_error_message",
            ],
        )

        user_test_cases = [
            TestCase(
                test_name="User unauthorized access",
                request_body={},
                expected_error_code="403",
                expected_error_message="Admin only.",
            ),
        ]

        admin_test_cases = [
            TestCase(
                test_name="Didn't provide old tag name",
                request_body={},
                expected_error_code="400",
                expected_error_message="You must provide the old tag name.",
            ),
            TestCase(
                test_name="Provide non-existent tag to delete",
                request_body={"oldTagName": "new_tag"},
                expected_error_code="400",
                expected_error_message="Tag no longer exists in the database.",
            ),
            TestCase(
                test_name="Can't delete primary tag as admin",
                request_body={"oldTagName": "resource"},
                expected_error_code="401",
                expected_error_message="You don\\'t have permission to delete this tag.",
            ),
        ]

        owner_test_cases = [
            TestCase(
                test_name="Didn't provide replacement tag name",
                request_body={"oldTagName": "resource"},
                expected_error_code="400",
                expected_error_message="You must provide a replacement tag name.",
            ),
            TestCase(
                test_name="Didn't provide replacement tag name",
                request_body={
                    "oldTagName": "resource",
                    "replacementTagName": "new_tag",
                },
                expected_error_code="400",
                expected_error_message="You must provide a replacement tag name.",
            ),
            TestCase(
                test_name="Replacement tag is the tag to be deleted",
                request_body={
                    "oldTagName": "resource",
                    "replacementTagName": "resource",
                },
                expected_error_code="400",
                expected_error_message="Replacement tag is the same as deleting tag.",
            ),
        ]

        all_test_cases = [user_test_cases, admin_test_cases, owner_test_cases]

        with self.app.app_context():
            for idx, test_cases in enumerate(all_test_cases):
                if idx == 0:
                    self.webtest_app.authorization = ("Bearer", self.user_new_token)
                elif idx == 1:
                    self.webtest_app.authorization = ("Bearer", self.user_admin_token)
                else:
                    self.webtest_app.authorization = ("Bearer", self.user_owner_token)

                for test_case in test_cases:
                    with self.subTest(msg=test_case.test_name):
                        # Assert validation errors are raised for the test cases defined above.
                        with self.assertRaises(webtest.AppError) as exception:
                            self.webtest_app.put_json(
                                "/api/tags", test_case.request_body
                            )

                        # Assert the HTTP Response Code and the error messages are what we expect.
                        res_code, res_body = str(exception.exception).split("\n")
                        self.assertTrue(test_case.expected_error_code in res_code)
                        self.assertTrue(test_case.expected_error_message in res_body)
