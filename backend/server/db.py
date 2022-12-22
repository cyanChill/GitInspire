from flask_sqlalchemy import SQLAlchemy

# Create database extension
db = SQLAlchemy()

# Function to initialize database & create tables if they weren't created.
def init_db(app, reset=False):
    from server.models import (
        Language, Repository, RepoAssociations, Tag, User, Log, Report
    )

    db.init_app(app)

    with app.app_context():
        if reset:
            db.drop_all()
            db.session.commit()

        db.create_all()
