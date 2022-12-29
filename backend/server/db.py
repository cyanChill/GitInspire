from flask_sqlalchemy import SQLAlchemy
import sqlalchemy as sa

# Create database extension
db = SQLAlchemy()

# Function to initialize database & create tables if they weren't created.
def init_db(app, reset=False):
    from server.models import Language, Repository, Tag, User, Log, Report

    db.init_app(app)

    with app.app_context():
        if reset:
            insp = sa.inspect(db.engine)
            for tb_entry in reversed(insp.get_sorted_table_and_fkc_names()):
                tb_name = tb_entry[0]

                if tb_name:
                    with db.engine.begin() as conn:
                        conn.execute(sa.text(f'DROP TABLE "{tb_name}"'))

            db.session.commit()

        db.create_all()
