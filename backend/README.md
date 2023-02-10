# GitInspire [Server]

## Setup

There's some setup needed such as `SECRET_KEY` and `SQLALCHEMY_DATABASE_URI`.

1. Create a `instance` folder in the `backend` folder.
2. Create a `config.py` file in the `instance` folder.
3. We'll treat this like a `.env` file in JavaScript and create a `SECRET_KEY` and `SQLALCHEMY_DATABASE_URI` entry and populate those values.
4. For having Github OAuth, we need to create a [Github OAuth app](https://docs.github.com/en/developers/apps/building-oauth-apps/creating-an-oauth-app) and obtain values for `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`.
5. We need a `GITHUB_REDIRECT_URI` which is the `Authorization callback URL` value for the Github OAuth app.
   > This value should refer to the `login` route on the client side.
6. For the JWTs we create, we need a `JWT_SECRET_KEY` variable as well.
   > Since we're storing these in cookies, we need to set `JWT_TOKEN_LOCATION = 'cookies'`
   > By default, **jwt cookies will expire when the session closes**. To change this, provide a `JWT_ACCESS_TOKEN_EXPIRES` and set `JWT_SESSION_COOKIE = False`.
   > For production, we need `JWT_COOKIE_SECURE = True`.

## Initializing the Database

We can run `python init_db_data.py` within the `backend` directory to populate the database with dummy data.

### Pulling Data from Database & Pushing CSV data

If for example we're using a provider that provides a database with a finite lifespan, you can utilize the provided `pull_db_data.py` file to pull the data from the database and store data from each class in it's own CSV file in the `instance` folder.
> We run `python pull_db_data.py` to pull data from our database.

To push the data from the CSV files created from the `pull_db_data.py` file, we run `python push_csv_data.py` to populate the database with previous data.
> **Note:** This will reset all data in the database.

## Running the Server

To run the server code, run `flask --app server run` while in the `backend` directory.

- To run the code in debug mode, do `flask --app server --debug run`.
