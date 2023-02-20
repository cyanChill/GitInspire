import collections

from tests import testBase


class Repository_Route_Test(testBase.TestBase):
    def assert_tags(self, response_tags, expected_tags):
        actual_names = [tag["name"] for tag in response_tags]
        expected_names = [tag["name"] for tag in expected_tags]
        self.assertCountEqual(expected_names, actual_names)

    def test_suggestRepository(self):
        with self.app.app_context():
            TestCase = collections.namedtuple(
                "TestCase",
                ["test_name", "request_url", "post_data", "expected_response"],
            )

            new_repo_data = {
                "author": "cyanChill",
                "repo_name": "Battleship",
                "primary_tag": {"label": "Project Idea", "value": "project_idea"},
                "tags": [{"label": "Frontend", "value": "frontend"}],
            }

            reference_repo_data = {
                "id": 407959883,
                "primary_tag": {
                    "display_name": "Project Idea",
                    "name": "project_idea",
                    "type": "primary",
                },
                "tags": [
                    {"display_name": "Frontend", "name": "frontend", "type": "user_gen"}
                ],
            }

            test_cases = [
                TestCase(
                    test_name="Create repository",
                    request_url="/api/repositories/create",
                    post_data=new_repo_data,
                    expected_response={
                        "message": "Successfully suggested repository.",
                        "repo_exerpt": reference_repo_data,
                    },
                ),
                TestCase(
                    test_name="Suggest existing repository",
                    request_url="/api/repositories/create",
                    post_data=new_repo_data,
                    expected_response={
                        "message": "Repository already exists in our database.",
                        "repo_exerpt": reference_repo_data,
                    },
                ),
            ]

            for test_case in test_cases:
                with self.subTest(msg=test_case.test_name):
                    response = self.webtest_app.post_json(
                        test_case.request_url, test_case.post_data
                    ).json
                    self.assertEqual(
                        response["message"], test_case.expected_response["message"]
                    )

                    repo = response["repository"]
                    expected_repo = test_case.expected_response["repo_exerpt"]
                    # If "id" is equivalent, all other GitHub provided values
                    # in the Repository object should be correct
                    self.assertEqual(repo["id"], expected_repo["id"])

                    self.assertEqual(
                        repo["primary_tag"]["name"],
                        expected_repo["primary_tag"]["name"],
                    )
                    self.assert_tags(repo["tags"], expected_repo["tags"])
