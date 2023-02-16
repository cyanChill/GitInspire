from datetime import datetime

from server.models.User import User, AccountStatusEnum
from server.models.Tag import Tag, TagTypeEnum
from server.models.Language import Language
from server.models.Repository import Repository, RepoLanguage, RepoTag
from server.utils import normalizeStr


def gen_dummyData():
    d_user = User(
        id=0,
        username="dummyUser",
        avatar_url="https://avatars.githubusercontent.com/u/83375816?v=4",
        github_created_at=datetime.strptime(
            "2021-04-28T21:49:19Z", "%Y-%m-%dT%H:%M:%SZ"
        ),
        account_status=AccountStatusEnum["user"],
    )

    d_primary_tag = Tag(
        name=normalizeStr("Project Idea"),
        display_name="Project Idea",
        type=TagTypeEnum["primary"],
        suggested_by=d_user.id,
    )
    d_tag = Tag(
        name=normalizeStr("Frontend"),
        display_name="Frontend",
        type=TagTypeEnum["user_gen"],
        suggested_by=d_user.id,
    )

    d_language_1 = Language(
        name=normalizeStr("Ruby on Rails"), display_name="Ruby on Rails"
    )
    d_language_2 = Language(name=normalizeStr("HTML"), display_name="HTML")

    d_repo = Repository(
        id=0,
        author="testAuthor",
        repo_name="test-repo",
        description="This is a non-existent repository",
        stars=1337,
        _primary_tag=d_primary_tag.name,
        suggested_by=d_user.id,
    )

    d_repo_lang_relation_1 = RepoLanguage(
        repo_id=d_repo.id,
        language_name=d_language_1.name,
        is_primary=True,
    )
    d_repo_lang_relation_2 = RepoLanguage(
        repo_id=d_repo.id,
        language_name=d_language_2.name,
        is_primary=False,
    )

    d_repo_tag_relation = RepoTag(repo_id=d_repo.id, tag_name=d_tag.name)

    return [
        d_user,
        d_primary_tag,
        d_tag,
        d_language_1,
        d_language_2,
        d_repo,
        d_repo_lang_relation_1,
        d_repo_lang_relation_2,
        d_repo_tag_relation,
    ]
