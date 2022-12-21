from sqlalchemy import Column, DateTime, Integer, String, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from sqlalchemy.ext.hybrid import hybrid_property

from server.db import db


class Report(db.Model):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True)
    repo_id = Column(Integer, ForeignKey("repositories.id"), nullable=True)
    tag_name = Column(String, ForeignKey("tags.name"), nullable=True)
    reason = Column(String, nullable=False)
    reported_by = Column(Integer, ForeignKey("users.id"), nullable=False)

    created_at = Column(DateTime, server_default=func.now())
    last_updated = Column(DateTime, server_default=func.now(), onupdate=func.now())

    user = relationship("User", backref="reports")

    @hybrid_property
    def content_id(self):
        return self.repo_id or self.tag_name

    @hybrid_property
    def report_type(self):
        return "repository" if self.repo_id else "tag"

    def as_dict(self):
        return {
            "id": self.id,
            "content_id": self.content_id,
            "type": self.report_type,
            "reason": self.reason,
            "reported_by": self.user.as_dict(),
            "created_at": self.created_at.isoformat(),
            "last_updated": self.last_updated.isoformat(),
        }

    def __repr__(self):
        return f"<Report type='{self.report_type}' content_id='{self.content_id}' reporter='{self.user.username}'>"
