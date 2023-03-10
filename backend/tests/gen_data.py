from datetime import datetime

from server.models.User import User, AccountStatusEnum
from server.models.Tag import Tag, TagTypeEnum
from server.models.Language import Language
from server.models.Repository import Repository, RepoLanguage, RepoTag
from server.utils import normalizeStr


def gen_dummyData():
    d_user_0 = User(
        id=0,
        username="oldUser",
        avatar_url="https://avatars.githubusercontent.com/u/83375816?v=4",
        github_created_at=datetime.strptime(
            "2021-04-28T21:49:19Z", "%Y-%m-%dT%H:%M:%SZ"
        ),
        account_status=AccountStatusEnum["user"],
    )
    d_user_1 = User(
        id=1,
        username="youngUser",
        avatar_url="https://avatars.githubusercontent.com/u/83375816?v=4",
        github_created_at=datetime.strptime(
            "3021-04-28T21:49:19Z", "%Y-%m-%dT%H:%M:%SZ"
        ),
        account_status=AccountStatusEnum["user"],
    )
    d_user_2 = User(
        id=2,
        username="Admin",
        avatar_url="https://avatars.githubusercontent.com/u/83375816?v=4",
        github_created_at=datetime.strptime(
            "2020-04-28T21:49:19Z", "%Y-%m-%dT%H:%M:%SZ"
        ),
        account_status=AccountStatusEnum["admin"],
    )

    d_primary_tag_1 = Tag(
        name=normalizeStr("Project Idea"),
        display_name="Project Idea",
        type=TagTypeEnum["primary"],
        suggested_by=d_user_0.id,
    )
    d_primary_tag_2 = Tag(
        name=normalizeStr("Resource"),
        display_name="Resource",
        type=TagTypeEnum["primary"],
        suggested_by=d_user_0.id,
    )
    d_tag = Tag(
        name=normalizeStr("Frontend"),
        display_name="Frontend",
        type=TagTypeEnum["user_gen"],
        suggested_by=d_user_0.id,
    )

    d_language_1 = Language(
        name=normalizeStr("Ruby on Rails"), display_name="Ruby on Rails"
    )
    d_language_2 = Language(name=normalizeStr("HTML"), display_name="HTML")
    d_language_3 = Language(name=normalizeStr("Java"), display_name="Java")
    d_language_4 = Language(name=normalizeStr("CSS"), display_name="CSS")

    d_repo_1 = Repository(
        id=394012075,
        author="cyanChill",
        repo_name="google-homepage",
        description="non-existent description",
        stars=0,
        _primary_tag=d_primary_tag_1.name,
        suggested_by=d_user_0.id,
        last_updated=datetime.strptime(
            "2022-01-01T21:49:19Z", "%Y-%m-%dT%H:%M:%SZ"
        )
    )
    d_repo_2 = Repository(
        id=10270250,
        author="facebook",
        repo_name="react",
        description="A declarative, efficient, and flexible JavaScript library for building user interfaces.",
        stars=203575,
        _primary_tag=d_primary_tag_2.name,
        suggested_by=d_user_0.id,
    )
    d_repo_3 = Repository(
        id=0,
        author="na",
        repo_name="this-doesnt-exist",
        description="non-existent description",
        stars=0,
        _primary_tag=d_primary_tag_2.name,
        suggested_by=d_user_0.id,
        last_updated=datetime.strptime(
            "2023-01-01T21:49:19Z", "%Y-%m-%dT%H:%M:%SZ"
        )
    )

    d_repo_lang_relation_1 = RepoLanguage(
        repo_id=d_repo_1.id,
        language_name=d_language_4.name,
        is_primary=True,
    )
    d_repo_lang_relation_2 = RepoLanguage(
        repo_id=d_repo_1.id,
        language_name=d_language_1.name,
        is_primary=False,
    )
    d_repo_lang_relation_3 = RepoLanguage(
        repo_id=d_repo_3.id,
        language_name=d_language_1.name,
        is_primary=False,
    )

    d_repo_tag_relation_1 = RepoTag(repo_id=d_repo_1.id, tag_name=d_tag.name)
    d_repo_tag_relation_2 = RepoTag(repo_id=d_repo_3.id, tag_name=d_tag.name)

    return [
        d_user_0,
        d_user_1,
        d_user_2,
        d_primary_tag_1,
        d_primary_tag_2,
        d_tag,
        d_language_1,
        d_language_2,
        d_language_3,
        d_language_4,
        d_repo_1,
        d_repo_2,
        d_repo_3,
        d_repo_lang_relation_1,
        d_repo_lang_relation_2,
        d_repo_lang_relation_3,
        d_repo_tag_relation_1,
        d_repo_tag_relation_2,
    ]
