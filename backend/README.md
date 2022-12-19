# Repot Server

## Setup

There's some setup needed such as `SECRET_KEY` and `SQLALCHEMY_DATABASE_URI`.

1. Create a `instance` folder in the `backend` folder.
2. Create a `config.py` file in the `instance` folder.
3. We'll treat this like a `.env` file in JavaScript and create a `SECRET_KEY` and `SQLALCHEMY_DATABASE_URI` entry and populate those values.

## Initializing the Database

We can run `python init_db_data.py` within the `backend` directory to populate the database.

## Running the Server

To run the server code, run `flask --app server run` while in the `backend` directory.

- To run the code in debug mode, do `flask --app server --debug run`.
