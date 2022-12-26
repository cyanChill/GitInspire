from sqlalchemy import Column, DateTime, Integer, String, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from sqlalchemy.ext.hybrid import hybrid_property

from server.db import db
from server.utils import serialize_sqlalchemy_objs


class Repository(db.Model):
    __tablename__ = "repositories"

    # Stuff populated from Github
    id = Column(Integer, primary_key=True)
    author = Column(String, nullable=False)
    repo_name = Column(String, nullable=False)
    description = Column(String)
    stars = Column(Integer, nullable=False)
    maintain_link = Column(String)

    @hybrid_property
    def repo_link(self):
        # Will be a valid link as author & repo_name have specific naming
        # conventions
        return f"https://github.com/{self.author}/{self.repo_name}"

    # Stuff populated by our database
    languages = relationship("RepoLanguage", uselist=True, backref="repositories")
    primary_tag = Column(String, ForeignKey("tags.name"))
    tags = relationship("RepoTag", uselist=True, backref="repositories")

    suggested_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    last_updated = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relations with other tables:
    user = relationship("User", back_populates="suggested_repos")

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
            "primary_tag": self.primary_tag,
            "tags": repo_tags,
            "suggested_by": self.user.as_dict(),
            "created_at": self.created_at.isoformat(),
            "last_updated": self.last_updated.isoformat(),
        }

    def __repr__(self):
        return f"<Repository repo_name='{self.repo_name}' author='{self.author}'>"
