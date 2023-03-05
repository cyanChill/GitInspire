from flask import Blueprint, request, jsonify, current_app as app
import requests
import random

from server.utils import normalizeStr

bp = Blueprint("random", __name__, url_prefix="/random")


@bp.route("/")
def get_random_repository():
    limit = request.args.get("limit", default=100, type=int)

    langs = request.args.get("languages", default="", type=str)
    minStars = request.args.get("minStars", default=0, type=int)
    maxStars = request.args.get("maxStars", default=None, type=int)

    if minStars < 0 or (maxStars != None and minStars >= maxStars):
        return jsonify({"message": "Invalid values for star parameters."}), 400

    # Get query string for "language" filter
    filtered_lang = [
        normalizeStr(lang) for lang in langs.lower().split(",") if lang.strip() != ""
    ]
    if len(filtered_lang) > 3:
        return jsonify({"message": "Too many languages."}), 400

    langQuery = (
        ""
        if len(filtered_lang) == 0
        else "+{}".format("+".join([f'language:"{lang}"' for lang in filtered_lang]))
    )
    # Get query string for "stars" filter
    #  - Create a random "min" value to reduce the chance of getting the
    #    same results from the GitHub API route
    randMin = random.randint(minStars, maxStars if maxStars != None else 10000)
    starsQuery = (
        f"stars:>={randMin}" if maxStars == None else f"stars:{randMin}..{maxStars}"
    )

    try:
        # Will fetch up to 100 results for this "page" (allows pagination)
        request_url = f"https://api.github.com/search/repositories?q={starsQuery}{langQuery}&per_page={limit}&sort=stars&order=asc"
        print(request_url)
        resp = requests.get(
            request_url,
            # Below does the "-u client_id:client_secret" in the CURL command
            auth=(app.config["GITHUB_CLIENT_ID"], app.config["GITHUB_CLIENT_SECRET"]),
            headers={
                "Accept": "application/vnd.github.text-match+json",
                "User-Agent": "gitinspire-server",
            },
        )
        data = resp.json()

        if resp.status_code == 200:
            # Return up to 100 results to save on rate limit
            return jsonify({"results": data["items"]}), 200
        else:
            return jsonify({"message": "Something went wrong with your request."}), 503
    except:
        return jsonify({"message": "Something went wrong with your request."}), 500
