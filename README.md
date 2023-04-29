# GitInspire

![License](https://badgen.net/github/license/cyanChill/GitInspire)
![Backend Tests](https://github.com/cyanChill/GitInspire/actions/workflows/test_deploy_backend.yml/badge.svg)
![Client Tests](https://github.com/cyanChill/GitInspire/actions/workflows/test_deploy_frontend.yml/badge.svg)

A platform to discover and bring life back to abandoned repositories and more.

## Features

GitInspire is an application that allows users to discover repositories on GitHub based on certain languages and a range of stars.

Alternatively, you can discover more specific repositories suit for your needs through our **Discover** feature which allows GitHub users to suggest repositories they may find helpful to others and label them with tags to help the search process.

- Some primary tags that can be filtered through our database of suggested repositories include `Abandoned`, `Project Ideas`, `Open Source`, and `Resource` repositories.

Fellow developers and GitHub users can help contribute to our database of categorized repositories through our **Contribute** feature.

- GitHub users that are >3 months old can contribute by suggesting repositories that can be helpful to others.
- GitHub users that are >1 year old can contribute suggesting tags to provide more labeling options and help fine-tune your search.

With repositories labeled as `Abandoned`, you can help other by suggesting links to repositories that are alternatives or picks off what was left off.

Since this is an app centered on GitHub repositories, login is through your GitHub account.

## General Rubric

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
