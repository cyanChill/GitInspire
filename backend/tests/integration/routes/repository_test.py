import collections
import pytest
import webtest

from tests import testBase


class Repository_Route_Test(testBase.TestBase):
    def assert_response(self, response, expected_repos):
        """
        A helper method that asserts whether an HTTP response includes the
        suspected Repository ids
        """
        actual_ids = [repo["id"] for repo in response]
        expected_ids = [repo["id"] for repo in expected_repos]
        self.assertCountEqual(actual_ids, expected_ids)

    def test_get_repository(self):
        TestCase = collections.namedtuple(
            "TestCase", ["test_name", "request_url", "expected_res"]
        )

        test_cases = [
            TestCase(
                test_name="Get specific repository (that exists)",
                request_url="/api/repositories/0",
                expected_res={
                    "message": "Repository found.",
                    "repo_exerpt": {"id": 0},
                },
            ),
            TestCase(
                test_name="Get specific repository (that doesn't exists)",
                request_url="/api/repositories/23423423",
                expected_res={
                    "message": "Repository not found.",
                    "repo_exerpt": None,
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

                    repo = response["repository"]
                    expected_repo = test_case.expected_res["repo_exerpt"]

                    if repo != None:  # Repo found
                        # Assert the response only includes the expected Language names
                        self.assert_response([repo], [expected_repo])
                    else:  # Repo not found
                        self.assertTrue(expected_repo == None)

    def test_create_repository(self):
        # Instantiate request payload.
        request_body = {
            "author": "cyanChill",
            "repo_name": "Battleship",
            "primary_tag": {"label": "Project Idea", "value": "project_idea"},
            "tags": [{"label": "Frontend", "value": "frontend"}],
        }

        TestCase = collections.namedtuple("TestCase", ["test_name", "expected_message"])

        test_cases = [
            TestCase(
                test_name="Creating a new repository.",
                expected_message="Successfully suggested repository.",
            ),
            TestCase(
                test_name="Creating an existing repository.",
                expected_message="Repository already exists in our database.",
            ),
        ]

        with self.app.app_context():
            for test_case in test_cases:
                with self.subTest(msg=test_case.test_name):
                    # Set authorization token to be user >3 months old
                    self.webtest_app.authorization = ("Bearer", self.user_0_token)
                    # Send an HTTP Post Request to "/repositories"
                    response = self.webtest_app.post_json(
                        "/api/repositories", request_body
                    ).json
                    # Assert response message
                    self.assertEqual(response["message"], test_case.expected_message)
                    # Assert various aspects of the response object
                    repo = response["repository"]
                    self.assertEqual(repo["id"], 407959883)
                    self.assertEqual(repo["author"], "cyanChill")
                    self.assertEqual(repo["repo_name"], "Battleship")
                    self.assertEqual(repo["primary_tag"]["name"], "project_idea")
                    self.assertEqual(repo["suggested_by"]["id"], 0)
                    self.assertEqual(len(repo["tags"]), 1)

    def test_create_repository_bad_request(self):
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
                expected_error_message="GitHub account age must be older than 3 months to suggest repository.",
            ),
            TestCase(
                test_name="Missing author",
                request_body={},
                expected_error_code="400",
                expected_error_message="author can\\'t be blank.",
            ),
            TestCase(
                test_name="Missing repo_name",
                request_body={"author": "cyanChill"},
                expected_error_code="400",
                expected_error_message="repo_name can\\'t be blank.",
            ),
            TestCase(
                test_name="Missing primary_tag",
                request_body={"author": "cyanChill", "repo_name": "Battleship"},
                expected_error_code="400",
                expected_error_message="primary_tag can\\'t be blank.",
            ),
            TestCase(
                test_name="Empty (just spaces) author",
                request_body={
                    "author": " ",
                    "repo_name": "Battleship",
                    "primary_tag": "",
                },
                expected_error_code="400",
                expected_error_message="An author must be provided.",
            ),
            TestCase(
                test_name="Empty (just spaces) repo_name",
                request_body={
                    "author": "cyanChill",
                    "repo_name": " ",
                    "primary_tag": "",
                },
                expected_error_code="400",
                expected_error_message="A repository name must be provided.",
            ),
            TestCase(
                test_name="Empty (just spaces) repo_name",
                request_body={
                    "author": "cyanChill",
                    "repo_name": "Battleship",
                    "primary_tag": "",
                },
                expected_error_code="500",
                expected_error_message="Something went wrong with validating tags.",
            ),
        ]

        with self.app.app_context():
            for idx, test_case in enumerate(test_cases):
                if idx < 1:
                    # Set authorization token to be user <3 months old
                    self.webtest_app.authorization = ("Bearer", self.user_1_token)
                else:
                    # Set authorization token to be user >3 months old
                    self.webtest_app.authorization = ("Bearer", self.user_0_token)

                with self.subTest(msg=test_case.test_name):
                    # Assert validation errors are raised for the test cases defined above.
                    with self.assertRaises(webtest.AppError) as exception:
                        self.webtest_app.post_json(
                            "/api/repositories", test_case.request_body
                        )

                    # Assert the HTTP Response Code and the error messages are what we expect.
                    response_code, response_body = str(exception.exception).split("\n")
                    self.assertTrue(test_case.expected_error_code in response_code)
                    self.assertTrue(test_case.expected_error_message in response_body)

    @pytest.mark.skip(reason="Not implemented.")
    def test_update_repository(self):
        pass

    @pytest.mark.skip(reason="Not implemented.")
    def test_delete_repository(self):
        pass
