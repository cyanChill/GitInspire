from sqlalchemy import Column, DateTime, Integer, String, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from server.db import db


class Report(db.Model):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True)
    type = Column(String, nullable=False)
    content_id = Column(String)
    reason = Column(String, nullable=False)  # Or description
    maintain_link = Column(String)
    info = Column(String, nullable=False)

    reported_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User")

    created_at = Column(DateTime, server_default=func.now())

    def as_dict(self):
        return {
            "id": self.id,
            "type": self.type,
            "content_id": self.content_id,
            "reason": self.reason,
            "maintain_link": self.maintain_link,
            "info": self.info,
            "reported_by": self.user.as_dict(),
            "created_at": self.created_at.isoformat(),
        }

    def __repr__(self):
        return f"<Report type='{self.type}' content_id='{self.content_id}' reporter='{self.user.username}'>"
