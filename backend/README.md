<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->
<a name="readme-top"></a>



<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/cyanChill/GitInspire">
    <img src="../client/public/assets/gitinspire.svg" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">GitInspire [Server]</h3>

  <p align="center">
    A platform to discover new repositories and bring life back to abandoned ones.
    <br />
    <a href="https://github.com/cyanChill/GitInspire"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/cyanChill/GitInspire/issues">Report Bug</a>
    ·
    <a href="https://github.com/cyanChill/GitInspire/issues">Request Feature</a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#setup">Setup</a></li>
    <li>
      <a href="#initializing-the-database">Initializing the Database</a>
      <ul>
        <li><a href="#pulling-data-from-database--pushing-csv-data">Pulling Data from Database & Pushing CSV data</a></li>
      </ul>
    </li>
    <li><a href="#running-the-server">Running the Server</a></li>
  </ol>
</details>



<!-- SETUP -->
## Setup

For this project, we require a `.env` file to hold our secrets for our application. The `.env` file should be placed in the `server` folder.

| Variable Name               | Description                                                                                                                                                                               |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ENVIRONMENT`               | Values include: `development`, `production`, or `testing`.                                                                                                                                |
| `SECRET_KEY`                | Used for signing security-related things in Flask.                                                                                                                                        |
| `JWT_SECRET_KEY`            | Used for encoding & decoding our JWTs.                                                                                                                                                    |
| `DEV_DATABASE_URL`          | This is the URI that should be used for the database connection for `development`.                                                                                                        |
| `PROD_DATABASE_URL`         | This is the URI that should be used for the database connection for `production`.                                                                                                         |
| `DEV_GITHUB_CLIENT_ID`      | This is the client id for our GitHub OAuth app for `development`. Instructions can be found [here](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app). |
| `DEV_GITHUB_CLIENT_SECRET`  | This is the client secret for our GitHub OAuth app for `development`.                                                                                                                     |
| `DEV_GITHUB_REDIRECT_URI`   | This is the `Authorization callback URL` value for the Github OAuth app for `development`.                                                                                                |
| `PROD_GITHUB_CLIENT_ID`     | This is the client id for our GitHub OAuth app for `production`.                                                                                                                          |
| `PROD_GITHUB_CLIENT_SECRET` | This is the client secret for our GitHub OAuth app for `production`.                                                                                                                      |
| `PROD_GITHUB_REDIRECT_URI`  | This is the `Authorization callback URL` value for the Github OAuth app for `production`.                                                                                                 |

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- INITIALIZING THE DATABASE -->
## Initializing the Database

We can run `python init_db_data.py` within the `backend` directory to populate the database with dummy data.

### Pulling Data from Database & Pushing CSV data

If for example we're using a provider that provides a database with a finite lifespan, you can utilize the provided `pull_db_data.py` file to pull the data from the database and store data from each class in it's own CSV file in the `instance` folder.

> We run `python pull_db_data.py` to pull data from our database.

To push the data from the CSV files created from the `pull_db_data.py` file, we run `python push_csv_data.py` to populate the database with previous data.

> **Note:** This will reset all data in the database.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- RUNNING THE SERVER -->
## Running the Server

To run the server code, run `flask --app server run` while in the `backend` directory.

- For running the code in **`production mode`** for **`UNIX`**, we have the `gunicorn` package, in which we run `gunicorn "server:create_app()"` in the `backend` directory.

- To run the code in **`debug mode`**, do `flask --app server --debug run`.

<p align="right">(<a href="#readme-top">back to top</a>)</p>
