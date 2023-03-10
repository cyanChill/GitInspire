import collections

from tests import testBase
from server.models.Repository import Repository, RepoLanguage


class RepositoryTest(testBase.TestBase):
    def test_repo_link_property(self):
        TestCase = collections.namedtuple(
            "TestCase", ["test_name", "repository", "expected_link"]
        )

        with self.app.app_context():
            repo_info = Repository.query.filter_by(id=394012075).first()

            test_cases = [
                TestCase(
                    test_name="Repository 'repo_link' Property",
                    repository=repo_info,
                    expected_link="https://github.com/cyanChill/google-homepage",
                )
            ]

            for test_case in test_cases:
                with self.subTest(msg=test_case.test_name):
                    actual_link = test_case.repository.repo_link
                    self.assertEqual(actual_link, test_case.expected_link)

    def test_repository_language_relation(self):
        TestCase = collections.namedtuple(
            "TestCase", ["test_name", "repository", "expected_langs"]
        )

        with self.app.app_context():
            repo_info = Repository.query.filter_by(id=394012075).first()
            repo_lang = RepoLanguage.query.filter_by(repo_id=394012075).all()

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

                    # Check if we have the same language objects via "name" property
                    actual_lang_names = [lang.language_name for lang in actual_val]
                    expected_lang_names = [
                        lang.language_name for lang in test_case.expected_langs
                    ]
                    self.assertEqual(
                        sorted(actual_lang_names), sorted(expected_lang_names)
                    )

    def test_repo_response_lang_order(self):
        TestCase = collections.namedtuple(
            "TestCase", ["test_name", "repository", "expected_order"]
        )

        with self.app.app_context():
            repo_info = Repository.query.filter_by(id=394012075).first()

            test_cases = [
                TestCase(
                    test_name="Repository language Relation",
                    repository=repo_info,
                    expected_order=[
                        {"name": "css", "display_name": "CSS"},
                        {"name": "ruby_on_rails", "display_name": "Ruby on Rails"},
                    ],
                )
            ]

            for test_case in test_cases:
                with self.subTest(msg=test_case.test_name):
                    actual_val = test_case.repository.as_dict()["languages"]
                    self.assertEqual(actual_val, test_case.expected_order)
