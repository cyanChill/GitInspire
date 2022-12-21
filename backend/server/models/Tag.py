import enum
from sqlalchemy import Column, DateTime, Enum, Integer, String, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from server.db import db


class TagTypeEnum(enum.Enum):
    primary = 1
    user_gen = 2


class Tag(db.Model):
    __tablename__ = "tags"

    name = Column(String, primary_key=True)
    display_name = Column(String, nullable=False)
    type = Column(Enum(TagTypeEnum), nullable=False)

    suggested_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, server_default=func.now())
    last_updated = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relations with other tables:
    user = relationship("User", back_populates="suggested_tags")

    def as_dict(self):
        return {
            "name": self.name,
            "display_name": self.display_name,
            "type": self.type.name,
            "suggested_by": self.user.as_dict() if self.user else None,
            "created_at": self.created_at.isoformat(),
            "last_updated": self.last_updated.isoformat(),
        }

    def __repr__(self):
        return f"<Tag display_name='{self.display_name}' type='{self.type.name}' suggested_by='{self.user}'>"
