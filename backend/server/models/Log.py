import enum
from sqlalchemy import Column, DateTime, Enum, Integer, String, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from sqlalchemy.ext.hybrid import hybrid_property

from server.db import db


class LogActionEnum(enum.Enum):
    banned = 1
    updated = 2
    deleted = 3


class LogTypeEnum(enum.Enum):
    user = 1
    repository = 2
    tag = 3


class Log(db.Model):
    __tablename__ = "logs"

    id = Column(Integer, primary_key=True)
    action = Column(Enum(LogActionEnum), nullable=False)
    type = Column(Enum(LogTypeEnum), nullable=False)
    repo_id = Column(Integer, ForeignKey("repositories.id"), nullable=True)
    tag_name = Column(String, ForeignKey("tags.name"), nullable=True)
    enacted_by = Column(Integer, ForeignKey("users.id"), nullable=False)

    created_at = Column(DateTime, server_default=func.now())
    last_updated = Column(DateTime, server_default=func.now(), onupdate=func.now())

    user = relationship("User", backref="logs")

    @hybrid_property
    def content_id(self):
        return self.repo_id or self.tag_name

    def as_dict(self):
        return {
            "id": self.id,
            "action": self.action.name,
            "content_id": self.content_id,
            "type": self.type.name,
            "enacted_by": self.user.as_dict(),
            "created_at": self.created_at.isoformat(),
            "last_updated": self.last_updated.isoformat(),
        }

    def __repr__(self):
        return f"<Log type='{self.type.name}' content_id='{self.content_id}' enacted_by='{self.user.username}'>"
