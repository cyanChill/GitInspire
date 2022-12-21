import enum
from sqlalchemy import Column, DateTime, Enum, Integer, String
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from server.db import db
from server.utils import serialize_sqlalchemy_objs

# https://docs.sqlalchemy.org/en/14/core/type_basics.html#sqlalchemy.types.Enum
class AccountStatusEnum(enum.Enum):
    banned = 1
    user = 2
    admin = 50
    owner = 100


class User(db.Model):
    __tablename__ = "users"

    # Stuff populated by Github
    id = Column(Integer, primary_key=True)
    username = Column(String, nullable=False)
    avatar_url = Column(String, nullable=False)
    github_created_at = Column(DateTime, nullable=False)

    account_status = Column(Enum(AccountStatusEnum), nullable=False)
    user_notes = Column(String)

    last_updated = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relations with other tables:
    suggested_tags = relationship("Tag", back_populates="user")
    suggested_repos = relationship("Repository", back_populates="user")

    def contributions(self):
        return {
            "suggested_tags": serialize_sqlalchemy_objs(self.suggested_tags),
            "suggested_repos": serialize_sqlalchemy_objs(self.suggested_repos),
        }

    def as_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "avatar_url": self.avatar_url,
            "github_created_at": self.github_created_at,
            "account_status": self.account_status.name,
            "last_updated": self.last_updated.isoformat(),
        }

    def __repr__(self):
        return f"<User username='{self.username}' id={self.id} status={self.account_status.name}>"
