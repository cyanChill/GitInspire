# Repot Server

## Setup

There's some setup needed such as `SECRET_KEY` and `SQLALCHEMY_DATABASE_URI`.

1. Create a `instance` folder in the `backend` folder.
2. Create a `config.py` file in the `instance` folder.
3. We'll treat this like a `.env` file in JavaScript and create a `SECRET_KEY` and `SQLALCHEMY_DATABASE_URI` entry and populate those values.
4. For having Github OAuth, we need to create a [Github OAuth app](https://docs.github.com/en/developers/apps/building-oauth-apps/creating-an-oauth-app) and obtain values for `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`.
5. We need a `GITHUB_REDIRECT_URI` which is the `Authorization callback URL` value for the Github OAuth app.
   > This value should refer to the `login` route on the client side.

## Initializing the Database

We can run `python init_db_data.py` within the `backend` directory to populate the database.

## Running the Server

To run the server code, run `flask --app server run` while in the `backend` directory.

- To run the code in debug mode, do `flask --app server --debug run`.
