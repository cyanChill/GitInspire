# ----------------------------------------------------------------------
#  File to help push the data in our CSV files that we've pulled from
#  our database provider (such as Render) back to the database (or a
#  new Postgres database as Render allows these database to last for
#  90 days before we have to make a new one).
#   - Based on "pull_db_data.py", we expect the database CSV files to be
#     in the "instance" folder with the default naming scheme
# ----------------------------------------------------------------------

import csv
from flask import Flask

import server.configuration as configuration
from server.models.Language import Language
from server.models.Repository import Repository, RepoLanguage, RepoTag
from server.models.Tag import Tag, TagTypeEnum
from server.models.User import User, AccountStatusEnum
from server.models.Report import Report, ContentTypeEnum
from server.models.Log import Log, LogActionEnum

app = Flask(__name__, instance_relative_config=True)

# Load configs
app.config.from_object(configuration.configuration["development"])

# Initialize database & tables
from server.db import init_db, db

init_db(app, reset=True)


def read_csv(filePath):
    data = []

    with open(filePath, encoding="UTF8", newline="") as f:
        reader = csv.reader(f, delimiter=" ")
        # Skip header
        next(reader)

        for line in reader:
            data.append(line)

    return data


with app.app_context():
    language_data = read_csv("instance/language_data.csv")
    for lang in language_data:
        new_lang = Language(name=lang[0], display_name=lang[1])
        db.session.add(new_lang)

    user_data = read_csv("instance/user_data.csv")
    for user in user_data:
        new_user = User(
            id=user[0],
            username=user[1],
            avatar_url=user[2],
            github_created_at=user[3],
            account_status=AccountStatusEnum[user[4]],
            ban_reason=user[5],
            last_updated=user[6],
        )
        db.session.add(new_user)

    tag_data = read_csv("instance/tag_data.csv")
    for tag in tag_data:
        new_tag = Tag(
            name=tag[0],
            display_name=tag[1],
            type=TagTypeEnum[tag[2]],
            suggested_by=tag[3] or None,
        )
        db.session.add(new_tag)

    repository_data = read_csv("instance/repository_data.csv")
    for repo in repository_data:
        new_repo = Repository(
            id=repo[0],
            author=repo[1],
            repo_name=repo[2],
            description=repo[3],
            stars=repo[4],
            maintain_link=repo[5],
            _primary_tag=repo[6],
            suggested_by=repo[7],
            last_updated=repo[8],
        )
        db.session.add(new_repo)

    repository_language_data = read_csv("instance/repository_language_data.csv")
    for repo_lang in repository_language_data:
        new_repo_lang = RepoLanguage(
            repo_id=repo_lang[0],
            language_name=repo_lang[1],
            is_primary=(True if repo_lang[2] == "True" else False),
        )
        db.session.add(new_repo_lang)

    repository_tag_data = read_csv("instance/repository_tag_data.csv")
    for repo_tag in repository_tag_data:
        new_repo_tag = RepoTag(repo_id=repo_tag[0], tag_name=repo_tag[1])
        db.session.add(new_repo_tag)

    report_data = read_csv("instance/report_data.csv")
    for report in report_data:
        new_report = Report(
            id=report[0],
            type=ContentTypeEnum[report[1]],
            content_id=report[2],
            reason=report[3],
            reported_by=report[4],
            created_at=report[5],
        )
        db.session.add(new_report)

    log_data = read_csv("instance/log_data.csv")
    for log in log_data:
        new_log = Log(
            id=log[0],
            action=LogActionEnum[log[1]],
            type=ContentTypeEnum[log[2]],
            content_id=log[3],
            enacted_by=log[4],
            created_at=log[5],
        )
        db.session.add(new_log)

    db.session.commit()
    print("Successfully pushed CSV data into database.")
