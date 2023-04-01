from flask import Blueprint, g, jsonify, request
from flask_jwt_extended import jwt_required
import traceback

from server.db import db
from server.models.Report import Report
from server.utils import serialize_sqlalchemy_objs, isXMonthOld, normalizeStr
from server.routes.auth import not_banned, admin_required

bp = Blueprint("report", __name__, url_prefix="/report")


@bp.route("/")
@jwt_required()
@admin_required()
def get_all_reports():
    # TODO: Get all reports and organize them

    return jsonify({"message": "Route not implemented."}), 500


@bp.route("/", methods=["POST"])
@jwt_required()
@not_banned()
def create_report():
    user = g.user.as_dict()
    # Parse the JSON data in the request's body.
    report_data = request.get_json()

    # Validate that the client provided all required fields.
    required_fields = ["type", "reason", "info"]
    for field in required_fields:
        if field not in report_data:
            return jsonify({"message": f"{field} can't be blank."}), 400
        elif report_data[field].strip() == "":
            return jsonify({"message": f"{field} can't be blank."}), 400

    # Other input validation checks.
    report_type = report_data["type"]
    report_reason = report_data["reason"]
    report_info = report_data["info"]
    # Get values for not required fields
    report_id = request.json.get("content_id", "").strip()
    report_link = request.json.get("maintain_link", "").strip()

    if report_type in ["repository", "tag", "user"]:
        if report_id == "":
            print("Empty report Id")
            return jsonify({"message": "A content id/name must be provided."}), 400

    if report_type == "repository" and report_reason == "maintain_link":
        if report_link == "":
            return jsonify({"message": "A maintain link must be provided."}), 400

    # Initialize and populate a Report object.
    report = Report()
    report.type = report_type
    report.content_id = report_id
    report.reason = report_reason
    report.maintain_link = report_link
    report.info = report_info
    report.reported_by = user["id"]

    try:
        # Add the Tag to the database and commit the transaction.
        db.session.add(report)
        db.session.commit()

        response = {
            "message": "Successfully create report.",
            "report": report.as_dict(),
        }
        return jsonify(response), 200
    except:
        # Some unknown response has occurred.
        print(traceback.format_exc())
        return jsonify({"message": "Failed to create report."}), 500


@bp.route("/<string:reportId>", methods=["DELETE"])
@jwt_required()
@admin_required()
def handle_report(reportId):
    # Make sure the report exists before we do anything

    return jsonify({"message": "Route not implemented."}), 500
