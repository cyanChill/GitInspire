from sqlalchemy import Column, Integer, String, Boolean, ForeignKey

from server.db import db


class RepoLanguage(db.Model):
    __tablename__ = "repository_languages"

    repo_id = Column(Integer, ForeignKey("repositories.id"), primary_key=True)
    language_name = Column(String, ForeignKey("languages.name"), primary_key=True)
    is_primary = Column(Boolean, default=False)

    def __repr__(self):
        return f"<RepoLanguage repo_id={self.repo_id} language_name='{self.language_name}' is_primary={self.is_primary}>"


class RepoTag(db.Model):
    __tablename__ = "repository_tags"

    repo_id = Column(Integer, ForeignKey("repositories.id"), primary_key=True)
    tag_name = Column(String, ForeignKey("tags.name"), primary_key=True)

    def __repr__(self):
        return f"<RepoTag repo_id={self.repo_id} tag_name='{self.tag_name}'>"
