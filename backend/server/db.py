from flask_sqlalchemy import SQLAlchemy

# Create database extension
db = SQLAlchemy()

# Function to initialize database & create tables if they weren't created.
def init_app(app, reset=False):
    from server.models import Language, Repository, RepoAssociations, Tag, User

    # from server.models.Log import Log
    # from server.models.Report import Report

    db.init_app(app)

    with app.app_context():
        if reset:
            db.drop_all()
            db.session.commit()

        db.create_all()
