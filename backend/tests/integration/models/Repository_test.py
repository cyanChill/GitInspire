import collections

from tests import testBase
from server.models.Repository import Repository, RepoLanguage


class RepositoryTest(testBase.TestBase):
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
            repo_lang = RepoLanguage.query.filter_by(
                repo_id=0, language_name="ruby_on_rails"
            ).first()

            TestCase = collections.namedtuple(
                "TestCase", ["test_name", "repository", "expected_langs"]
            )

            test_cases = [
                TestCase(
                    test_name="Repository language Relation",
                    repository=repo_info,
                    expected_langs=[repo_lang],
                )
            ]

            for test_case in test_cases:
                with self.subTest(msg=test_case.test_name):
                    actual_val = test_case.repository.languages
                    self.assertEqual(actual_val, test_case.expected_langs)
