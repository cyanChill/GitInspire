# ----------------------------------------------------------------------
#  The purpose of this function is to pull all data from our database
#  and store the data in some text files.
#   - This is useful if you're on a free online database provider such
#     as Render which provides a free Postgres database for free for
#     90 days before it's closed.
#   - This way, we can pull the data from the database before it's
#     planned closure and upload that data in a new instance of a
#     Postgres database [can only have 1 free Postgres database
#     instance at a time in Render which closes after 90 days]
#
# In the current configuration, the data pulled from the database will
# be stored in CSV files in the "instance" folder 
# ----------------------------------------------------------------------

import os
import csv
from flask import Flask

from server.models.Language import Language
from server.models.Repository import Repository, RepoLanguage, RepoTag
from server.models.Tag import Tag
from server.models.User import User
from server.models.Report import Report
from server.models.Log import Log

app = Flask(__name__, instance_relative_config=True)

# ensure the instance folder exists
try:
    os.makedirs(app.instance_path)
except OSError:
    pass

# Load configs from "config.py" file in "instance" folder
app.config.from_pyfile("config.py")

# Initialize database & tables
from server.db import init_db

init_db(app)


def write_csv(filePath, header, data):
    with open(filePath, "w", encoding="UTF8", newline="") as f:
        writer = csv.writer(f, delimiter=" ")
        # Write header
        writer.writerow(header)
        # Write data
        writer.writerows(data)


with app.app_context():
    # Pull all languages from database
    all_langs = Language.query.all()
    write_csv(
        "instance/language_data.csv",
        ["name", "display_name"],
        [[x.name, x.display_name] for x in all_langs],
    )

    # Pull all tags from database
    all_tags = Tag.query.all()
    write_csv(
        "instance/tag_data.csv",
        ["name", "display_name", "type", "suggested_by"],
        [[x.name, x.display_name, x.type.name, x.suggested_by] for x in all_tags],
    )

    # Pull all users from database
    all_users = User.query.all()
    write_csv(
        "instance/user_data.csv",
        [
            "id",
            "username",
            "avatar_url",
            "github_created_at",
            "account_status",
            "ban_reason",
            "last_updated",
        ],
        [
            [
                x.id,
                x.username,
                x.avatar_url,
                x.github_created_at,
                x.account_status.name,
                x.ban_reason,
                x.last_updated,
            ]
            for x in all_users
        ],
    )

    # Pull all repositories from database
    all_repos = Repository.query.all()
    write_csv(
        "instance/repository_data.csv",
        [
            "id",
            "author",
            "repo_name",
            "description",
            "stars",
            "maintain_link",
            "_primary_tag",
            "suggested_by",
            "last_updated",
        ],
        [
            [
                x.id,
                x.author,
                x.repo_name,
                x.description,
                x.stars,
                x.maintain_link,
                x._primary_tag,
                x.suggested_by,
                x.last_updated,
            ]
            for x in all_repos
        ],
    )

    # Pull all repository language relations from database
    all_repo_langs = RepoLanguage.query.all()
    write_csv(
        "instance/repository_language_data.csv",
        ["repo_id", "language_name", "is_primary"],
        [[x.repo_id, x.language_name, x.is_primary] for x in all_repo_langs],
    )

    # Pull all repository tag relations from database
    all_repo_tags = RepoTag.query.all()
    write_csv(
        "instance/repository_tag_data.csv",
        ["repo_id", "tag_name"],
        [[x.repo_id, x.tag_name] for x in all_repo_tags],
    )

    # Pull all reports from database
    all_reports = Report.query.all()
    write_csv(
        "instance/report_data.csv",
        ["id", "type", "content_id", "reason", "reported_by", "created_at"],
        [
            [
                x.id,
                x.type.name,
                x.content_id,
                x.reason,
                x.reported_by,
                x.created_at,
            ]
            for x in all_reports
        ],
    )

    # Pull all logs from database
    all_logs = Log.query.all()
    write_csv(
        "instance/log_data.csv",
        ["id", "action", "type", "content_id", "enacted_by", "created_at"],
        [
            [
                x.id,
                x.action.name,
                x.type.name,
                x.content_id,
                x.enacted_by,
                x.created_at,
            ]
            for x in all_logs
        ],
    )

    print("Successfully pulled database data and put in CSV files.")
