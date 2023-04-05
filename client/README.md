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
