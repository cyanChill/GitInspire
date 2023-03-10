import collections
import pytest
import webtest
from datetime import date, datetime

from tests import testBase
from server.db import db
from server.models.Repository import Repository, RepoLanguage, RepoTag


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
                request_url="/api/repositories/394012075",
                expected_res={
                    "message": "Repository found.",
                    "repo_exerpt": {"id": 394012075},
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

    def test_filter_repositories(self):
        TestCase = collections.namedtuple(
            "TestCase", ["test_name", "request_url", "expected_res"]
        )

        with self.app.app_context():
            repo_1 = Repository.query.filter_by(id=394012075).first()
            repo_2 = Repository.query.filter_by(id=10270250).first()
            repo_3 = Repository.query.filter_by(id=0).first()

            test_cases = [
                TestCase(
                    test_name="Filter repository by languages (that exists)",
                    request_url="/api/repositories/filter?languages=css,ruby_on_rails",
                    expected_res={
                        "message": "Found results.",
                        "currPage": 0,
                        "numPages": 1,
                        "repositories": [repo_1.as_dict()],
                    },
                ),
                TestCase(
                    test_name="Filter repository by languages (that doesn't exists)",
                    request_url="/api/repositories/filter?languages=java",
                    expected_res={
                        "message": "Found results.",
                        "currPage": 0,
                        "numPages": 0,
                        "repositories": [],
                    },
                ),
                TestCase(
                    test_name="Filter repository by _primary_tag",
                    request_url="/api/repositories/filter?primary_tag=project_idea",
                    expected_res={
                        "message": "Found results.",
                        "currPage": 0,
                        "numPages": 1,
                        "repositories": [repo_1.as_dict()],
                    },
                ),
                TestCase(
                    test_name="Filter repository by tags",
                    request_url="/api/repositories/filter?tags=frontend",
                    expected_res={
                        "message": "Found results.",
                        "currPage": 0,
                        "numPages": 1,
                        "repositories": [repo_1.as_dict(), repo_3.as_dict()],
                    },
                ),
                TestCase(
                    test_name="Filter repository by stars (that exists)",
                    request_url="/api/repositories/filter?minStars=0&maxStars=1500",
                    expected_res={
                        "message": "Found results.",
                        "currPage": 0,
                        "numPages": 1,
                        "repositories": [repo_1.as_dict(), repo_3.as_dict()],
                    },
                ),
                TestCase(
                    test_name="Filter repository by stars (that doesn't exists)",
                    request_url="/api/repositories/filter?minStars=500&maxStars=1000",
                    expected_res={
                        "message": "Found results.",
                        "currPage": 0,
                        "numPages": 0,
                        "repositories": [],
                    },
                ),
                TestCase(
                    test_name="Sort repository by stars (asc)",
                    request_url="/api/repositories/filter?sort=stars&order=asc",
                    expected_res={
                        "message": "Found results.",
                        "currPage": 0,
                        "numPages": 1,
                        "repositories": [
                            repo_2.as_dict(),
                            repo_3.as_dict(),
                            repo_1.as_dict(),
                        ],
                    },
                ),
                TestCase(
                    test_name="Sort repository by stars (desc)",
                    request_url="/api/repositories/filter?sort=stars&order=desc",
                    expected_res={
                        "message": "Found results.",
                        "currPage": 0,
                        "numPages": 1,
                        "repositories": [
                            repo_1.as_dict(),
                            repo_3.as_dict(),
                            repo_2.as_dict(),
                        ],
                    },
                ),
            ]

            for test_case in test_cases:
                with self.subTest(msg=test_case.test_name):
                    response = self.webtest_app.get(test_case.request_url).json
                    self.assertEqual(
                        response["message"], test_case.expected_res["message"]
                    )

                    repos = response["repositories"]
                    expected_repos = test_case.expected_res["repositories"]
                    self.assertEqual(
                        response["currPage"], test_case.expected_res["currPage"]
                    )
                    self.assert_response(repos, expected_repos)

    def test_refresh_repository(self):
        TestCase = collections.namedtuple(
            "TestCase", ["test_name", "repo_id", "expected_res"]
        )

        with self.app.app_context():
            recent_repo = Repository(
                id=407959883,
                author="cyanChill",
                repo_name="Battleship",
                description="",
                stars=0,
                _primary_tag="project_idea",
                suggested_by="0",
            )
            # Add recent repo
            db.session.add(recent_repo)
            db.session.commit()

            repo_1 = Repository.query.filter_by(id=394012075).first()
            repo_1_dict = repo_1.as_dict()
            repo_1_dict["description"] = None
            repo_1_dict["languages"] = [
                {"name": "css", "display_name": "CSS"},
                {"name": "html", "display_name": "HTML"},
            ]
            currDate = date.today()
            repo_1_dict["last_updated"] = currDate

            test_cases = [
                TestCase(
                    test_name="Refreshing repository recently refreshed",
                    repo_id="407959883",
                    expected_res={
                        "message": "Repository has been recently updated.",
                        "repository": recent_repo.as_dict(),
                    },
                ),
                TestCase(
                    test_name="Refreshing repository with refreshable content.",
                    repo_id="394012075",
                    expected_res={
                        "message": "Refreshed repository information.",
                        "repository": repo_1_dict,
                    },
                ),
            ]

            for test_case in test_cases:
                with self.subTest(msg=test_case.test_name):
                    response = self.webtest_app.get(
                        f"/api/repositories/{test_case.repo_id}/refresh"
                    ).json

                    self.assertEqual(
                        response["message"], test_case.expected_res["message"]
                    )

                    repo = response["repository"]
                    expected_repo = test_case.expected_res["repository"]
                    # Ignore properties that won't change
                    del expected_repo["tags"]
                    del expected_repo["suggested_by"]

                    # Deal with last_updated property check
                    repo_date_1 = datetime.strptime(
                        repo["last_updated"], "%Y-%m-%dT%H:%M:%S"
                    )
                    self.assertEqual(repo_date_1.month, currDate.month)
                    self.assertEqual(repo_date_1.day, currDate.day)
                    self.assertEqual(repo_date_1.year, currDate.year)

                    del expected_repo["last_updated"]

                    for item in expected_repo.items():
                        self.assertEqual(repo[item[0]], item[1])

    def test_refresh_repository_bad_request(self):
        TestCase = collections.namedtuple(
            "TestCase",
            [
                "test_name",
                "repo_id",
                "expected_error_code",
                "expected_error_message",
            ],
        )

        test_cases = [
            TestCase(
                test_name="Repository doesn't exist",
                repo_id="10",
                expected_error_code="404",
                expected_error_message="Repository with repository id 10 doesn\\'t exist.",
            ),
            TestCase(
                test_name="Repository that doesn't exist in the API",
                repo_id="0",
                expected_error_code="410",
                expected_error_message="Repository is no longer accessible via the GitHub API and has been deleted from our database.",
            ),
        ]

        with self.app.app_context():
            for test_case in test_cases:
                with self.subTest(msg=test_case.test_name):
                    # Assert validation errors are raised for the test cases defined above.
                    with self.assertRaises(webtest.AppError) as exception:
                        self.webtest_app.get(
                            f"/api/repositories/{test_case.repo_id}/refresh"
                        )

                    # Assert the HTTP Response Code and the error messages are what we expect.
                    response_code, response_body = str(exception.exception).split("\n")
                    self.assertTrue(test_case.expected_error_code in response_code)
                    self.assertTrue(test_case.expected_error_message in response_body)

                    # If we deleted a repository in our database, ensure things have been deleted
                    if test_case.expected_error_code == "410":
                        dlt_repo = Repository.query.filter_by(id=0).first()
                        dlt_lang_rel = RepoLanguage.query.filter_by(repo_id=0).all()
                        dlt_tag_rel = RepoTag.query.filter_by(repo_id=0).all()
                        self.assertTrue(dlt_repo == None)
                        self.assertTrue(len(dlt_lang_rel) == 0)
                        self.assertTrue(len(dlt_tag_rel) == 0)

    @pytest.mark.skip(reason="Not implemented.")
    def test_update_repository(self):
        pass

    @pytest.mark.skip(reason="Not implemented.")
    def test_delete_repository(self):
        pass
