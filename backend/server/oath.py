from authlib.integrations.flask_client import OAuth

oauth = OAuth()

# Since we didn't provide a "client_kwargs={'scope':' '}", we only have
# access to public info (what we want)
oauth.register(
    name="github",
    access_token_url="https://github.com/login/oauth/access_token",
    access_token_params=None,
    authorize_url="https://github.com/login/oauth/authorize",
    authorize_params=None,
    api_base_url="https://api.github.com/",
)


def init_OAuth(app):
    oauth.init_app(app)
