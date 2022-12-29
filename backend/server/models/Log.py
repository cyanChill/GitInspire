import enum
from sqlalchemy import Column, DateTime, Enum, Integer, String, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from server.db import db
from server.models.Report import ContentTypeEnum


class LogActionEnum(enum.Enum):
    banned = 1
    updated = 2
    deleted = 3
    # Used on bug reports:
    resolved = 4


# A class to log the actions made by Admins & the Owner in regards to the
# state of users, repositories, tags, and reports.
class Log(db.Model):
    __tablename__ = "logs"

    id = Column(Integer, primary_key=True)
    action = Column(Enum(LogActionEnum), nullable=False)
    type = Column(Enum(ContentTypeEnum), nullable=False)
    content_id = Column(String)

    enacted_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User")

    created_at = Column(DateTime, server_default=func.now())

    def as_dict(self):
        return {
            "id": self.id,
            "action": self.action.name,
            "type": self.type.name,
            "content_id": self.content_id,
            "enacted_by": self.user.as_dict(),
            "created_at": self.created_at.isoformat(),
        }

    def __repr__(self):
        return f"<Log type='{self.type.name}' content_id='{self.content_id}' enacted_by='{self.user.username}'>"
