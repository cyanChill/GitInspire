import collections

from tests import testBase
from server.utils import serialize_sqlalchemy_objs
from server.models.Language import Language


class Languages_Route_Test(testBase.TestBase):
    def assert_response(self, response, expected_languages):
        actual_names = [lang["name"] for lang in response]
        expected_names = [lang["name"] for lang in expected_languages]
        self.assertCountEqual(expected_names, actual_names)

    def test_getLanguages(self):
        with self.app.app_context():
            all_langs = Language.query.all()
            serialized_langs = serialize_sqlalchemy_objs(all_langs)

            TestCase = collections.namedtuple(
                "TestCase", ["test_name", "request_url", "expected_languages"]
            )

            test_cases = [
                TestCase(
                    test_name="Retrieve all languages",
                    request_url="/api/languages",
                    expected_languages=serialized_langs,
                )
            ]

            for test_case in test_cases:
                with self.subTest(msg=test_case.test_name):
                    response = self.webtest_app.get(test_case.request_url).json
                    res_data = response["languages"]
                    self.assertEqual(len(res_data), len(test_case.expected_languages))
                    self.assert_response(res_data, test_case.expected_languages)
