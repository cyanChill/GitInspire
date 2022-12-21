# ----------------------------------------------------------------------
# File to help with populating the database as since we're using "Render"
# to host our PostgreSQL database & it's their policy to delete free-tier
# databases after 90 days, this helps with preserving data.
# ----------------------------------------------------------------------

import os
from flask import Flask

from server.models.Language import Language
from server.models.Repository import Repository
from server.models.RepoAssociations import RepoLanguage, RepoTag
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
from server.db import init_app, db

init_app(app, reset=True)


# Dummy data
languages = ["JavaScript", "HTML", "CSS", "Ruby on Rails"]
primary_tags = ["Abandoned", "Project Idea", "Tutorial", "Open Source"]
user_generated_tags = ["Web Development", "Machine Learning"]
users = [
    {
        "id": 83375816,
        "username": "cyanChill",
        "avatar_url": "https://avatars.githubusercontent.com/u/83375816?v=4",
        "github_created_at": "2021-04-28T21:49:19Z",
        "account_status": "owner",
    }
]
repositories = [
    {
        "id": 407959883,
        "author": "cyanChill",
        "repo_name": "Battleship",
        "description": None,
        "stars": 0,
        "repo_link": "https://github.com/cyanChill/Battleship",
        "languages": ["javascript", "css", "html"],
        "primary_tag": "project_idea",
        "tags": ["web_development"],
    }
]
# EXPERIMENTAL Data:
reports = [
    {
        "repo_id": 407959883,
        "tag_name": None,
        "reason": "Dummy report",
        "reported_by": 83375816,
    }
]
logs = [
    {
        "action": "updated",
        "type": "repository",
        "repo_id": 407959883,
        "tag_name": None,
        "enacted_by": 83375816,
    }
]


def normalizeStr(input_str):
    normalized = (
        "".join(ch for ch in input_str if ch.isalnum() or ch.isspace())
        .lower()
        .replace(" ", "_")
    )
    return normalized


with app.app_context():
    # Adding data to database
    for lang in languages:
        new_lang = Language(name=normalizeStr(lang), display_name=lang)
        db.session.add(new_lang)

    found_lang = Language.query.filter_by(name="javascript").first()
    print(found_lang)

    for usr in users:
        new_user = User(
            id=usr["id"],
            username=usr["username"],
            avatar_url=usr["avatar_url"],
            github_created_at=usr["github_created_at"],
            account_status=usr["account_status"],
        )
        db.session.add(new_user)

    found_user = User.query.filter_by(id=83375816).first()
    print(found_user)

    for tg in primary_tags:
        new_primary_tag = Tag(name=normalizeStr(tg), display_name=tg, type="primary")
        db.session.add(new_primary_tag)

    for tg in user_generated_tags:
        new_tag = Tag(
            name=normalizeStr(tg),
            display_name=tg,
            type="user_gen",
            suggested_by=found_user.id,
        )
        db.session.add(new_tag)

    ex_tag = Tag.query.filter_by(name="web_development").first()
    print(ex_tag)

    for repo in repositories:
        new_repo = Repository(
            id=repo["id"],
            author=repo["author"],
            repo_name=repo["repo_name"],
            description=repo["description"],
            stars=repo["stars"],
            repo_link=repo["repo_link"],
            primary_tag=repo["primary_tag"],
            suggested_by=found_user.id,
        )

        db.session.add(new_repo)

        for idx, lang in enumerate(repo["languages"]):
            found_lang = db.get_or_404(Language, lang)
            new_repoLang = RepoLanguage(
                repo_id=new_repo.id, language_name=found_lang.name, is_primary=idx == 0
            )
            db.session.add(new_repoLang)

        for idx, tg in enumerate(repo["tags"]):
            found_tg = db.get_or_404(Tag, tg)
            new_repoTag = RepoTag(repo_id=new_repo.id, tag_name=found_tg.name)
            db.session.add(new_repoTag)

    found_repo = Repository.query.filter_by(id=repositories[0]["id"]).first()
    print("\n", found_repo)
    print("Languages:\n", found_repo.languages)
    print("Tags:\n", found_repo.tags)

    # EXPERIMENTAL Tables:
    for rpt in reports:
        new_report = Report(
            repo_id=rpt["repo_id"],
            tag_name=rpt["tag_name"],
            reason=rpt["reason"],
            reported_by=rpt["reported_by"],
        )
        db.session.add(new_report)

    all_reports = Report.query.all()
    print("\n")
    for rpt in all_reports:
        print(f"{rpt}\nReport Id: {rpt.id}")

    for lg in logs:
        new_log = Log(
            action=lg["action"],
            type=lg["type"],
            repo_id=lg["repo_id"],
            tag_name=lg["tag_name"],
            enacted_by=lg["enacted_by"],
        )
        db.session.add(new_log)

    all_logs = Log.query.all()
    print("\n")
    for lg in all_logs:
        print(f"{lg}\nLog Id: {lg.id}")

    # Uncomment below to commit these changes to database:
    # db.session.commit()
