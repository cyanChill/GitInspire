> **Note**
> View the latest implementation of this application at <a href="https://github.com/cyanChill/RepoSift">RepoSift</a> which is built entirely in Next.js.
>
> I've updated this project through <a href="https://github.com/cyanChill/RepoSift">RepoSift</a> due to the challenges hosting GitInspire in its current form.
>   - As it's written in Python using Flask, free hosting options leads the experience using GitInspire to be subpar due to the cold-starts.
>   - Another issue is with my choice in the database provider, in which I have used Render's free PostgreSQL instance, which expires after 90 days.


<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->
<a name="readme-top"></a>


<hr />
<br />
<br />


<!-- PROJECT SHIELDS -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[![MIT License][license-shield]][license-url]
[![Backend Tests][backend-tests-shield]][backend-tests-url]
[![Client Tests][client-tests-shield]][client-tests-url]



<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/cyanChill/GitInspire">
    <img src="client/public/assets/gitinspire.svg" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">GitInspire</h3>

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
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#features">Features</a></li>
    <li><a href="#rubric">Rubric</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

GitInspire aims to help developers to come up with ideas more easily by providing:

1. An easy interface to find a random repository on GitHub given filters such as language and stars.
2. A database generated by other developers containing repositories labeled with "tags" to easily help provide more useful and narrower searches.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

- [![Next][Next.js]][Next-url]
- [![TypeScript][TypeScript]][TypeScript-url]
- [![Tailwind CSS][Tailwind]][Tailwind-url]
- [![Vercel][Vercel]][Vercel-url]
- [![Flask][Flask]][Flask-url]
- [![Python][Python]][Python-url]
- [![PostgreSQL][PostgreSQL]][PostgreSQL-url]
- [![Render][Render]][Render-url]

### Demo

https://github.com/cyanChill/GitInspire/assets/83375816/7ed30eea-77ee-43b5-9a2f-4a62a6f6f113

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

### Prerequisites

For this project, you're required to have `pnpm` and `pip` installed.

- You can find out how to install `pnpm` at: https://pnpm.io/installation.
- pip
  ```sh
  python -m pip install --upgrade pip
  ```

### Installation

1. Create a free GitHub OAuth App at [https://github.com/settings/developers](https://github.com/settings/developers)
2. Clone the repo
   ```sh
   git clone https://github.com/cyanChill/GitInspire.git
   ```
3. Follow the associated install instructions from `backend` & `client` folders.

   i. **Backend Instructions:** [Backend README][backend-readme-url]

   ii. **Client Instructions:** [Client README][client-readme-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- FEATURES -->
## Features

### Discover

Visitors of GitInspire can view a list of repositories suggested by users of our applications which are labeled with "tags". To achieve our goal of helping developers come up with ideas through inspiration, we allow them to filter through our database to get searches based on what they want.

- They can filter by **languages** a repository has, the **number of stars**, and through **tags** which help identify what the repository is about.

**Alternatively**, developers can utilize our interface to filter repositories directly from GitHub, which lacks the fine-grain search compared to searching through our database due to the lack of labeling.

> A great benefit of our labeling system is that a developer can label a repository as `Abandoned` to bring more awareness to it and hope for other developers to pick it up or suggest alternatives.

### Contribute

With the core of our application being developers helping other developers by suggesting repositories to our database and labeling them accordingly, we allow:

- GitHub accounts with an age **`>3 months`** to suggest repositories to grow our database to help others.
- GitHub accounts with an age **`>1 year`** to create tags to help better refine the search process by giving more options on how a repository can be labeled.

### GitHub Login

As an application centered around GitHub and its repositories, we allow users to sign into our application with their GitHub account to help contribute repositories and create tags.

**All data stored in our database such as repositories, tags, and user accounts are all public information. You can verify it by looking at:**

- Our code for the application (since it's available to the public): [GitInspire Authentication-Related Code](https://github.com/cyanChill/GitInspire/blob/main/backend/server/routes/auth.py#L124)
- Example response from GitHub's Rest API: [https://api.github.com/users/cyanChill](https://api.github.com/users/cyanChill)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- Rubric -->
## Rubric

|      Category      |                     Subcategory                      | Weight |      Completed       |
| :----------------: | :--------------------------------------------------: | :----: | :------------------: |
|  **ARCHITECTURE**  |                                                      |        |                      |
|                    |               MVC (Model, Controller)                |  10%   |  :white_check_mark:  |
|      **APIS**      |                                                      |        |                      |
|                    |                    Authentication                    |   5%   |  :white_check_mark:  |
|                    |                   Project Specific                   |   5%   |  :white_check_mark:  |
|    **BACKEND**     |                                                      |        |                      |
|                    |        Database (Relational, Non-Relational)         |  10%   |  :white_check_mark:  |
|                    | Python (Language), Flask (Framework), >10 API Routes |  10%   |  :white_check_mark:  |
|    **FRONTEND**    |                                                      |        |                      |
|                    |          Framework (Bootstrap, Foundation)           |  10%   |  :white_check_mark:  |
|                    |    React, React Router (>10 Components, >5 Pages)    |  10%   |  :white_check_mark:  |
| **AUTHENTICATION** |                                                      |        |                      |
|                    |          Local Strategy (Cookie + Session)           |  10%   | :white_large_square: |
|                    |        Third Party Strategy (Google, Github)         |   5%   |  :white_check_mark:  |
|   **DEPLOYMENT**   |                                                      |        |                      |
|                    |                        Heroku                        |  10%   |  :white_check_mark:  |
|    **TESTING**     |                                                      |        |                      |
|                    |                API; Unit, Integration                |   5%   |  :white_check_mark:  |
|                    |              Client; Unit, Integration               |   5%   | :white_large_square: |
|      **MISC**      |                                                      |        |                      |
|                    |                        README                        |   5%   |  :white_check_mark:  |
|     **BONUS**      |                                                      |        |                      |
|                    |                Continuous Integration                |   5%   |  :white_check_mark:  |
|                    |                Continuous Deployment                 |   5%   |  :white_check_mark:  |
|                    |      JWT (JSON Web Token) Local Authentication       |  10%   | :white_large_square: |

> **Note:** The `Authentication` & `Project Specific` APIs are the "same" (the main API used is GitHub's REST API while we use a GitHub OAuth app to do authentication & handle it through GitHub's API).

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- LICENSE -->
## License

Distributed under the MIT License. See `license.md` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

- [README Template](https://github.com/othneildrew/Best-README-Template)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[backend-readme-url]: https://github.com/cyanChill/GitInspire/blob/main/backend/README.md
[backend-tests-shield]: https://github.com/cyanChill/GitInspire/actions/workflows/test_deploy_backend.yml/badge.svg
[backend-tests-url]: https://github.com/cyanChill/GitInspire/actions/workflows/test_deploy_backend.yml
[client-readme-url]: https://github.com/cyanChill/GitInspire/blob/main/client/README.md
[client-tests-shield]: https://github.com/cyanChill/GitInspire/actions/workflows/test_deploy_frontend.yml/badge.svg
[client-tests-url]: https://github.com/cyanChill/GitInspire/actions/workflows/test_deploy_frontend.yml
[Flask]: https://img.shields.io/badge/flask-000000?style=for-the-badge&logo=flask&logoColor=white
[Flask-url]: https://flask.palletsprojects.com/en/
[license-shield]: https://img.shields.io/github/license/cyanchill/gitinspire
[license-url]: https://github.com/cyanChill/GitInspire/blob/main/license.md
[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[Python]: https://img.shields.io/badge/python-ffd343?style=for-the-badge&logo=python
[Python-url]: https://www.python.org/
[Postgresql]: https://img.shields.io/badge/postgresql-336791?style=for-the-badge&logo=postgresql&logoColor=white
[Postgresql-url]: https://www.postgresql.org/
[Render]: https://img.shields.io/badge/render-000000?style=for-the-badge&logo=render
[Render-url]: https://render.com/
[Tailwind]: https://img.shields.io/badge/tailwind_css-0ea5e9?style=for-the-badge&logo=tailwindcss&logoColor=white
[Tailwind-url]: https://tailwindcss.com/
[TypeScript]: https://img.shields.io/badge/typescript-3178c6?style=for-the-badge&logo=typescript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org/
[Vercel]: https://img.shields.io/badge/vercel-000000?style=for-the-badge&logo=vercel&logoColor=white
[Vercel-url]: https://vercel.com/
