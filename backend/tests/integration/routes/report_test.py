import collections
import webtest

from tests import testBase


class Tags_Route_Test(testBase.TestBase):
    def assert_response(self, response, expected_response):
        """
        A helper method that asserts whether an HTTP response includes the
        expected key-value pairs
        """
        for key in expected_response.keys():
            self.assertEqual(response[key], expected_response[key])

    def test_get_all_reports(self):
        TestCase = collections.namedtuple(
            "TestCase", ["test_name", "expected_response"]
        )

        test_cases = [
            TestCase(
                test_name="Get all reports as an admin",
                expected_response={
                    "message": "Successfully obtained all reports.",
                    "reports": [],  # We have no reports in our test database
                },
            ),
        ]

        with self.app.app_context():
            for test_case in test_cases:
                # Set authorization token to be not a admin user
                self.webtest_app.authorization = ("Bearer", self.user_admin_token)

                with self.subTest(msg=test_case.test_name):
                    # Send an HTTP Get Request to "/report"
                    response = self.webtest_app.get("/api/report").json
                    self.assert_response(response, test_case.expected_response)

    def test_get_all_reports_bad_request(self):
        TestCase = collections.namedtuple(
            "TestCase", ["test_name", "expected_error_code", "expected_error_message"]
        )

        test_cases = [
            TestCase(
                test_name="Unauthorized access to get reports",
                expected_error_code="403",
                expected_error_message="Admin only.",
            ),
        ]

        with self.app.app_context():
            for test_case in test_cases:
                # Set authorization token to be not an admin user
                self.webtest_app.authorization = ("Bearer", self.user_0_token)

                with self.subTest(msg=test_case.test_name):
                    # Assert validation errors are raised for the test cases defined above.
                    with self.assertRaises(webtest.AppError) as exception:
                        self.webtest_app.get("/api/report")

                    # Assert the HTTP Response Code and the error messages are what we expect.
                    response_code, response_body = str(exception.exception).split("\n")
                    self.assertTrue(test_case.expected_error_code in response_code)
                    self.assertTrue(test_case.expected_error_message in response_body)

    def test_create_report(self):
        TestCase = collections.namedtuple(
            "TestCase", ["test_name", "request_body", "expected_response"]
        )

        test_cases = [
            TestCase(
                test_name="Create non repo/tag/user report",
                request_body={"type": "bug", "reason": "other", "info": "Test report"},
                expected_response={
                    "type": "bug",
                    "reason": "other",
                    "info": "Test report",
                },
            ),
            TestCase(
                test_name="Create repo/tag/user report",
                request_body={
                    "type": "repository",
                    "content_id": "1337",
                    "reason": "other",
                    "info": "Test report",
                },
                expected_response={
                    "type": "repository",
                    "content_id": "1337",
                    "reason": "other",
                    "info": "Test report",
                },
            ),
            TestCase(
                test_name="Create repo maintain link report",
                request_body={
                    "type": "repository",
                    "content_id": "1337",
                    "reason": "maintain_link",
                    "maintain_link": "https://www.github.com/cyanchill/battleship",
                    "info": "Test report",
                },
                expected_response={
                    "type": "repository",
                    "content_id": "1337",
                    "reason": "maintain_link",
                    "maintain_link": "https://www.github.com/cyanchill/battleship",
                    "info": "Test report",
                },
            ),
        ]

        with self.app.app_context():
            for test_case in test_cases:
                # Set authorization token to be user >1 year old
                self.webtest_app.authorization = ("Bearer", self.user_0_token)

                with self.subTest(msg=test_case.test_name):
                    # Send an HTTP Post Request to "/report"
                    response = self.webtest_app.post_json(
                        "/api/report", test_case.request_body
                    ).json
                    # Assert response
                    report = response["report"]
                    self.assert_response(report, test_case.expected_response)

    def test_create_report_bad_request(self):
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
                test_name="Missing type",
                request_body={},
                expected_error_code="400",
                expected_error_message="type can\\'t be blank.",
            ),
            TestCase(
                test_name="Missing reason",
                request_body={"type": "repository"},
                expected_error_code="400",
                expected_error_message="reason can\\'t be blank.",
            ),
            TestCase(
                test_name="Missing info",
                request_body={"type": "repository", "reason": "other"},
                expected_error_code="400",
                expected_error_message="info can\\'t be blank.",
            ),
            TestCase(
                test_name="Missing content_id",
                request_body={
                    "type": "repository",
                    "reason": "other",
                    "info": "test report",
                },
                expected_error_code="400",
                expected_error_message="A content id/name must be provided.",
            ),
            TestCase(
                test_name="Missing maintain_link",
                request_body={
                    "type": "repository",
                    "reason": "maintain_link",
                    "info": "test report",
                    "content_id": "1337",
                },
                expected_error_code="400",
                expected_error_message="A maintain link must be provided.",
            ),
            TestCase(
                test_name="Content Id > 25 characters",
                request_body={
                    "type": "repository",
                    "reason": "other",
                    "info": "test report",
                    "content_id": "Lorem ipsum dolor sit amet",
                },
                expected_error_code="400",
                expected_error_message="Content id/name can\\'t be more than 25 characters.",
            ),
            TestCase(
                test_name="Additional info > 280 characters",
                request_body={
                    "type": "repository",
                    "reason": "other",
                    "info": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in volupta",
                    "content_id": "Lorem ipsum dolor sit amet",
                },
                expected_error_code="400",
                expected_error_message="Additional information can\\'t be more than 280 characters.",
            ),
        ]

        with self.app.app_context():
            for test_case in test_cases:
                # Set authorization token to be user >1 year old
                self.webtest_app.authorization = ("Bearer", self.user_0_token)

                with self.subTest(msg=test_case.test_name):
                    # Assert validation errors are raised for the test cases defined above.
                    with self.assertRaises(webtest.AppError) as exception:
                        self.webtest_app.post_json(
                            "/api/report", test_case.request_body
                        )

                    # Assert the HTTP Response Code and the error messages are what we expect.
                    response_code, response_body = str(exception.exception).split("\n")
                    self.assertTrue(test_case.expected_error_code in response_code)
                    self.assertTrue(test_case.expected_error_message in response_body)
