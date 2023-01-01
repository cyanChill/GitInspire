from sqlalchemy import Column, DateTime, Integer, String, Boolean, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from sqlalchemy.ext.hybrid import hybrid_property

from server.db import db
from server.utils import serialize_sqlalchemy_objs

# The table representing user-suggested repositories
class Repository(db.Model):
    __tablename__ = "repositories"

    # Stuff populated from GitHub
    id = Column(Integer, primary_key=True)
    author = Column(String, nullable=False)
    repo_name = Column(String, nullable=False)
    description = Column(String)
    stars = Column(Integer, nullable=False)

    @hybrid_property
    def repo_link(self):
        # Created by following GitHub's naming conventions
        return f"https://github.com/{self.author}/{self.repo_name}"

    # Will contain the link to a new repository that is now maintaining this
    # "abandoned" repository
    maintain_link = Column(String)

    languages = relationship("RepoLanguage", uselist=True)

    _primary_tag = Column(String, ForeignKey("tags.name"))
    primary_tag = relationship("Tag")
    tags = relationship("RepoTag", uselist=True)

    suggested_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="suggested_repos")

    last_updated = Column(DateTime, server_default=func.now(), onupdate=func.now())

    def as_dict(self):
        # Sort the serialized "RepoLanguage" array, having the "is_primary=True"
        # entry at the front. Then return only the "language" attribute value.
        repo_languages = [
            item["language"]
            for item in sorted(
                serialize_sqlalchemy_objs(self.languages),
                key=lambda x: x["is_primary"],
                reverse=True,
            )
        ]

        _p_tag = self.primary_tag.as_dict()
        p_tag = {
            "name": _p_tag["name"],
            "display_name": _p_tag["display_name"],
            "type": _p_tag["type"],
        }
        repo_tags = [
            {
                "name": item["tag"]["name"],
                "display_name": item["tag"]["display_name"],
                "type": item["tag"]["type"],
            }
            for item in serialize_sqlalchemy_objs(self.tags)
        ]

        return {
            "id": self.id,
            "author": self.author,
            "repo_name": self.repo_name,
            "description": self.description,
            "stars": self.stars,
            "repo_link": self.repo_link,
            "maintain_link": self.maintain_link,
            "languages": repo_languages,
            "primary_tag": p_tag,
            "tags": repo_tags,
            "suggested_by": self.user.as_dict(),
            "last_updated": self.last_updated.isoformat(),
        }

    def __repr__(self):
        return f"<Repository repo_name='{self.repo_name}' author='{self.author}'>"


# The table to denote the relationship of a given language with a repository
class RepoLanguage(db.Model):
    __tablename__ = "repository_languages"

    repo_id = Column(Integer, ForeignKey("repositories.id"), primary_key=True)
    language_name = Column(String, ForeignKey("languages.name"), primary_key=True)
    language = relationship("Language")

    is_primary = Column(Boolean, default=False)

    def as_dict(self):
        return {
            "repo_id": self.repo_id,
            "language": self.language.as_dict(),
            "is_primary": self.is_primary,
        }

    def __repr__(self):
        return f"<RepoLanguage repo_id={self.repo_id} language_name='{self.language_name}' is_primary={self.is_primary}>"


# The table to denote the relationship of a given tag with a repository
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
