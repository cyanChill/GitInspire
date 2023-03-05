import collections

from tests import testBase


class Random_Route_Test(testBase.TestBase):
    def test_get_random_repository(self):
        with self.app.app_context():
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

                    self.assertTrue(
                        minStars <= res_entry["stargazers_count"] <= maxStars
                    )
                    self.assertTrue(res_entry["language"] in languages)
