# GitInspire [Client]

## Setup

For this project, we require a `.env.local` file to store our environment variables in the `client` folder. The variables that should be included are the following:

| Variable Name                 | Description                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_CLIENT_ID`       | This is obtained when we make a [GitHub OAuth App](https://github.com/settings/developers).                                                                                                                                                                                                                                                                                                                                    |
| `NEXT_PUBLIC_REDIRECT_URI`    | This is obtained when we make a [GitHub OAuth App](https://github.com/settings/developers) - this is the value for `Authorization callback URL`.                                                                                                                                                                                                                                                                               |
| `NEXT_PUBLIC_GITHUB_AUTH_URL` | This is the URL where we use to help authorize our user through GitHub (which the response from redirecting back to our application will be sent to the backend). The format is: `https://github.com/login/oauth/authorize?client_id=$NEXT_PUBLIC_CLIENT_ID&redirect_uri=$NEXT_PUBLIC_REDIRECT_URI`. <li>For deployment, you may want to hard-code the values instead of using references to other environment variables.</li> |
| `NEXT_PUBLIC_DOMAIN`          | This refers to the site where we'll host the frontend for SEO (Search Engine Optimization) purposes.                                                                                                                                                                                                                                                                                                                           |
| `NEXT_PUBLIC_BACKEND_URL`     | This refers to the URL where our backend is located (ie: `http://localhost:5000`).                                                                                                                                                                                                                                                                                                                                             |

## Running the Frontend

To run the frontend code (in development mode), run `npm run dev` while in the `client` directory.

- For production, you need to build the code using `npm run build` and then do `npm run start` to run off that build.
- A suggestion for hosting this frontend application is [Vercel](https://vercel.com/).

## Testing

To run tests associated with the frontent, run `npm test` while in the `client` directory.

## Routes

|        Route        |                                      Description                                      |   Auth Required?   |
| :-----------------: | :-----------------------------------------------------------------------------------: | :----------------: |
|         `/`         |                          Home page with random repo search.                           |        :x:         |
|    `/auth/login`    |      The login page (user can only view this page if they're not authenticated).      | `User w/out Auth`  |
|     `/discover`     |             Route to search our database of user-suggested repositories.              |        :x:         |
|    `/contribute`    | Form to either contribute a tag or suggest a repository (has additional constraints). | :white_check_mark: |
|  `/profile/[:id]`   |                         View the profile of a specific user.                          |        :x:         |
| `/repository/[:id]` |                              View a specific repository.                              |        :x:         |
|      `/report`      |                        A form to report or suggest something.                         | :white_check_mark: |
|       `/misc`       |                                  The settings page.                                   |        :x:         |

### Admin Routes

|         Route         |                              Description                               |
| :-------------------: | :--------------------------------------------------------------------: |
|       `/admin`        |             Page with links to the other management pages.             |
|     `/admin/logs`     | Page displaying some logs of admin actions or automatic server action. |
|   `/admin/reports`    |                Page displaying a list of user reports.                 |
| `/admin/repositories` |           Page to manage repostories (ie: update & delete).            |
|     `/admin/tags`     |               Page to manage tags (ie: update & delete).               |
|    `/admin/users`     |                   Page to manage users (ie: update).                   |
