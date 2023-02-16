import collections

from tests import testBase
from server.models.Repository import Repository, RepoLanguage


class RepositoryTest(testBase.TestBase):
    def assert_lang_response(self, response, expected_languages):
        actual_names = [lang.language_name for lang in response]
        expected_names = [lang.language_name for lang in expected_languages]
        self.assertCountEqual(expected_names, actual_names)

    def test_repo_link_property(self):
        with self.app.app_context():
            repo_info = Repository.query.filter_by(id=0).first()

            TestCase = collections.namedtuple(
                "TestCase", ["test_name", "repository", "expected_link"]
            )

            test_cases = [
                TestCase(
                    test_name="Repository 'repo_link' Property",
                    repository=repo_info,
                    expected_link="https://github.com/testAuthor/test-repo",
                )
            ]

            for test_case in test_cases:
                with self.subTest(msg=test_case.test_name):
                    actual_link = test_case.repository.repo_link
                    self.assertEqual(actual_link, test_case.expected_link)

    def test_repository_language_relation(self):
        with self.app.app_context():
            repo_info = Repository.query.filter_by(id=0).first()
            repo_lang = RepoLanguage.query.filter_by(repo_id=0).all()

            TestCase = collections.namedtuple(
                "TestCase", ["test_name", "repository", "expected_langs"]
            )

            test_cases = [
                TestCase(
                    test_name="Repository language Relation",
                    repository=repo_info,
                    expected_langs=repo_lang,
                )
            ]

            for test_case in test_cases:
                with self.subTest(msg=test_case.test_name):
                    actual_val = test_case.repository.languages
                    self.assert_lang_response(actual_val, test_case.expected_langs)

    def test_repo_response_lang_order(self):
        with self.app.app_context():
            repo_info = Repository.query.filter_by(id=0).first()

            TestCase = collections.namedtuple(
                "TestCase", ["test_name", "repository", "expected_order"]
            )

            test_cases = [
                TestCase(
                    test_name="Repository language Relation",
                    repository=repo_info,
                    expected_order=[
                        {"name": "ruby_on_rails", "display_name": "Ruby on Rails"},
                        {"name": "html", "display_name": "HTML"},
                    ],
                )
            ]

            for test_case in test_cases:
                with self.subTest(msg=test_case.test_name):
                    actual_val = test_case.repository.as_dict()["languages"]
                    self.assertEqual(actual_val, test_case.expected_order)
