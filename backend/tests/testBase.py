import unittest
from datetime import datetime
import webtest

from server import create_app
import server.configuration as configuration

# Ref: https://flask.palletsprojects.com/en/2.2.x/tutorial/tests/

class TestBase(unittest.TestCase):
  def setUp(self):
    super(TestBase, self).setUp()

    api = create_app(configuration.ConfigurationName.TESTING)

    # Set up dummy database values
    with api.app_context():
      from server.db import db
      from server.models.User import User, AccountStatusEnum
      from server.models.Tag import Tag, TagTypeEnum
      from server.models.Language import Language
      from server.models.Repository import Repository, RepoLanguage
      from server.utils import normalizeStr

      dummy_user = User(
          id=0,
          username="dummyUser",
          avatar_url="https://avatars.githubusercontent.com/u/83375816?v=4",
          github_created_at=datetime.strptime("2021-04-28T21:49:19Z","%Y-%m-%dT%H:%M:%SZ"),
          account_status=AccountStatusEnum["user"],
      )

      dummy_primary_tag = Tag(
          name=normalizeStr("Project Idea"),
          display_name="Project Idea",
          type=TagTypeEnum["primary"],
          suggested_by=dummy_user.id,
      )

      dummy_language = Language(
          name=normalizeStr("Ruby on Rails"), display_name=("Ruby on Rails")
      )

      repo_with_all_fields = Repository(
          id=0,
          author="testAuthor",
          repo_name="test-repo",
          description="This is a non-existent repository",
          stars=1337,
          _primary_tag=dummy_primary_tag.name,
          suggested_by=dummy_user.id,
      )

      repo_lang_relation = RepoLanguage(
          repo_id=repo_with_all_fields.id,
          language_name=dummy_language.name,
          is_primary=True,
      )

      db.session.add(dummy_user)
      db.session.add(dummy_primary_tag)
      db.session.add(dummy_language)
      db.session.add(repo_with_all_fields)
      db.session.add(repo_lang_relation)
      db.session.commit()

    self.app = api
    self.webtest_app = webtest.TestApp(api)
