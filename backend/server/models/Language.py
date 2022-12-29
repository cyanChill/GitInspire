from sqlalchemy import Column, String

from server.db import db


class Language(db.Model):
    __tablename__ = "languages"

    # Stuff populated by GitHub
    name = Column(String, primary_key=True)
    display_name = Column(String, nullable=False)

    def as_dict(self):
        return {"name": self.name, "display_name": self.display_name}

    def __repr__(self):
        return f"<Language display_name='{self.display_name}' name='{self.name}' >"
