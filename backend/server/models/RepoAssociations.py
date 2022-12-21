from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from server.db import db


class RepoLanguage(db.Model):
    __tablename__ = "repository_languages"

    repo_id = Column(Integer, ForeignKey("repositories.id"), primary_key=True)
    language_name = Column(String, ForeignKey("languages.name"), primary_key=True)
    is_primary = Column(Boolean, default=False)

    language = relationship("Language")

    def as_dict(self):
        return {
            "repo_id": self.repo_id,
            "language": self.language.as_dict(),
            "is_primary": self.is_primary,
        }

    def __repr__(self):
        return f"<RepoLanguage repo_id={self.repo_id} language_name='{self.language_name}' is_primary={self.is_primary}>"


class RepoTag(db.Model):
    __tablename__ = "repository_tags"

    repo_id = Column(Integer, ForeignKey("repositories.id"), primary_key=True)
    tag_name = Column(String, ForeignKey("tags.name"), primary_key=True)

    tag = relationship("Tag")

    def as_dict(self):
        return {
            "repo_id": self.repo_id,
            "tag": self.tag.as_dict(),
        }

    def __repr__(self):
        return f"<RepoTag repo_id={self.repo_id} tag_name='{self.tag_name}'>"
