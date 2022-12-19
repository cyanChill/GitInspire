from sqlalchemy import Column, DateTime, Integer, String, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from server.db import db


class Repository(db.Model):
    __tablename__ = "repositories"

    # Stuff populated from Github
    id = Column(Integer, primary_key=True)
    author = Column(String, nullable=False)
    repo_name = Column(String, nullable=False)
    description = Column(String)
    stars = Column(Integer, nullable=False)
    repo_link = Column(String, nullable=False)

    # Stuff populated by our database
    languages = relationship("RepoLanguage", uselist=True, backref="repositories")
    primary_tag = Column(String, ForeignKey("tags.name"))
    tags = relationship("RepoTag", uselist=True, backref="repositories")

    suggested_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    last_updated = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relations with other tables:
    user = relationship("User", back_populates="suggested_repos")

    def __repr__(self):
        return f"<Repository repo_name='{self.repo_name}' author='{self.author}'>"
