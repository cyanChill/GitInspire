import enum
from sqlalchemy import Column, DateTime, Enum, Integer, String, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from server.db import db


class ContentTypeEnum(enum.Enum):
    user = 1
    repository = 2
    tag = 3
    bug = 4
    # Below won't be an option in an actual report
    report = 5


class Report(db.Model):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True)
    type = Column(Enum(ContentTypeEnum), nullable=False)
    content_id = Column(String)
    reason = Column(String, nullable=False)  # Or description

    reported_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User")

    created_at = Column(DateTime, server_default=func.now())

    def as_dict(self):
        return {
            "id": self.id,
            "type": self.type.name,
            "content_id": self.content_id,
            "reason": self.reason,
            "reported_by": self.user.as_dict(),
            "created_at": self.created_at.isoformat(),
        }

    def __repr__(self):
        return f"<Report type='{self.type.name}' content_id='{self.content_id}' reporter='{self.user.username}'>"
