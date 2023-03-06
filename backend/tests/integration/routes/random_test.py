import collections
import webtest

from tests import testBase


class Random_Route_Test(testBase.TestBase):
    def test_get_random_repository(self):
        TestCase = collections.namedtuple(
            "TestCase", ["test_name", "request_url", "expected_properties"]
        )

        test_cases = [
            TestCase(
                test_name="Retrieve random repositories given filters",
                request_url="/api/random?minStars=10&maxStars=100&languages=javascript,css&limit=1",
                expected_properties={
                    "minStars": 10,
                    "maxStars": 100,
                    "languages": ["CSS", "JavaScript"],
                },
            )
        ]

        for test_case in test_cases:
            with self.subTest(msg=test_case.test_name):
                response = self.webtest_app.get(test_case.request_url).json
                res_entry = response["results"][0]

                minStars = test_case.expected_properties["minStars"]
                maxStars = test_case.expected_properties["maxStars"]
                languages = test_case.expected_properties["languages"]

                self.assertTrue(minStars <= res_entry["stargazers_count"] <= maxStars)
                self.assertTrue(res_entry["language"] in languages)

    def test_get_random_repository_bad_request(self):
        TestCase = collections.namedtuple(
            "TestCase",
            [
                "test_name",
                "request_url",
                "expected_error_code",
                "expected_error_message",
            ],
        )

        test_cases = [
            TestCase(
                test_name="Invalid star parameters",
                request_url="/api/random?minStars=100&maxStars=1&limit=1",
                expected_error_code="400",
                expected_error_message="Invalid values for star parameters.",
            ),
            TestCase(
                test_name="Too many language parameters",
                request_url="/api/random?languages=javascript,css,typescript,java,html,ruby_on_rails&limit=1",
                expected_error_code="400",
                expected_error_message="Too many languages.",
            ),
        ]

        with self.app.app_context():
            for test_case in test_cases:
                with self.subTest(msg=test_case.test_name):
                    # Assert validation errors are raised for the test cases defined above.
                    with self.assertRaises(webtest.AppError) as exception:
                        self.webtest_app.get(test_case.request_url)

                    # Assert the HTTP Response Code and the error messages are what we expect.
                    response_code, response_body = str(exception.exception).split("\n")
                    self.assertTrue(test_case.expected_error_code in response_code)
                    self.assertTrue(test_case.expected_error_message in response_body)
