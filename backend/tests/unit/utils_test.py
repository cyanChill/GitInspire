import collections
from datetime import datetime

from tests import testBase
import server.utils as utils
from server.models.Language import Language


class UtilTest(testBase.TestBase):
    def test_normalizeStr(self):
        TestCase = collections.namedtuple(
            "TestCase", ["test_name", "init_str", "expected_result"]
        )

        test_cases = [
            TestCase(
                test_name="Normalizing string with no space",
                init_str="C++",
                expected_result="c++",
            ),
            TestCase(
                test_name="Normalizing string with space",
                init_str="Machine Learning",
                expected_result="machine_learning",
            ),
        ]

        for test_case in test_cases:
            with self.subTest(msg=test_case.test_name):
                actual_val = utils.normalizeStr(test_case.init_str)
                self.assertEqual(actual_val, test_case.expected_result)

    def test_serialize_sqlalchemy_objs(self):
        lang_1 = Language(name="c++", display_name="C++")
        lang_2 = Language(name="go!", display_name="Go!")

        TestCase = collections.namedtuple(
            "TestCase", ["test_name", "sql_obj_arr", "expected_result"]
        )

        test_cases = [
            TestCase(
                test_name="Serializing array of 2 SQL Alchemy Objects into JSON",
                sql_obj_arr=[lang_1, lang_2],
                expected_result=[
                    {"name": "c++", "display_name": "C++"},
                    {"name": "go!", "display_name": "Go!"},
                ],
            ),
        ]

        for test_case in test_cases:
            with self.subTest(msg=test_case.test_name):
                actual_val = utils.serialize_sqlalchemy_objs(test_case.sql_obj_arr)
                self.assertEqual(actual_val, test_case.expected_result)

    def test_isXMonthOld(self):
        date_1 = datetime.strptime("2021-04-28T21:49:19Z", "%Y-%m-%dT%H:%M:%SZ")
        date_2 = datetime.strptime("2023-01-28T21:49:19Z", "%Y-%m-%dT%H:%M:%SZ")

        TestCase = collections.namedtuple(
            "TestCase", ["test_name", "datetimeObj", "months", "expected_result"]
        )

        test_cases = [
            TestCase(
                test_name="Seeing if account created on 04/28/2021 is at least 3 months old.",
                datetimeObj=date_1,
                months=3,
                expected_result=True,
            ),
            TestCase(
                test_name="Seeing if account created on 01/28/2023 is at least 3 months old.",
                datetimeObj=date_2,
                months=3,
                expected_result=False,
            ),
        ]

        for test_case in test_cases:
            with self.subTest(msg=test_case.test_name):
                actual_val = utils.isXMonthOld(test_case.datetimeObj, test_case.months)
                self.assertEqual(actual_val, test_case.expected_result)

    def test_filterLangs(self):
        TestCase = collections.namedtuple(
            "TestCase", ["test_name", "lang_obj", "expected_result"]
        )

        test_cases = [
            TestCase(
                test_name="Ordering languages by most used (from GitHub API)",
                lang_obj={"CSS": 3016, "JavaScript": 24743, "HTML": 783},
                expected_result=["JavaScript", "CSS", "HTML"],
            ),
        ]

        for test_case in test_cases:
            with self.subTest(msg=test_case.test_name):
                actual_val = utils.filterLangs(test_case.lang_obj)
                self.assertEqual(actual_val, test_case.expected_result)
