from flask import Blueprint, g, jsonify, request
from flask_jwt_extended import jwt_required
from sqlalchemy import delete
import traceback

from server.db import db
from server.models.Report import Report
from server.utils import serialize_sqlalchemy_objs
from server.routes.auth import not_banned, admin_required

bp = Blueprint("report", __name__, url_prefix="/report")


@bp.route("/")
@admin_required()
def get_all_reports():
    user = g.user.as_dict()

    reports = []
    if user["account_status"] == "owner":
        # Owner should have access to all reports
        reports = Report.query.all()
    elif user["account_status"] == "admin":
        # Admins should have access to some reports
        allowed_reports = ["repository", "user", "tag"]
        reports = Report.query.filter(Report.type.in_(allowed_reports)).all()

    response = {
        "message": "Successfully obtained all reports.",
        "reports": serialize_sqlalchemy_objs(reports),
    }
    return jsonify(response), 200


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
    report_type = report_data["type"].strip()
    report_reason = report_data["reason"].strip()
    report_info = report_data["info"].strip()
    if len(report_info) > 280:
        response_msg = "Additional information can't be more than 280 characters."
        return jsonify({"message": response_msg}), 400
    # Get values for not required fields
    report_id = request.json.get("content_id", "").strip()
    report_link = request.json.get("maintain_link", "").strip()

    if report_type in ["repository", "tag", "user"]:
        if report_id == "":
            return jsonify({"message": "A content id/name must be provided."}), 400
        if len(report_id) > 25:
            response = {"message": "Content id/name can't be more than 25 characters."}
            return jsonify(response), 400

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


@bp.route("/<int:reportId>", methods=["DELETE"])
@admin_required()
def handle_report(reportId):
    action = request.args.get("action", default="", type=str).strip()

    if not action in ["resolve", "dismiss"]:
        return jsonify({"message": "Invalid action on report."}), 400

    # Find report in database to see if it exists
    report = Report.query.filter_by(id=reportId).first()

    if report != None:
        response = {
            "message": f"Report has been {action}.",
            "report": report.as_dict(),
        }
        # Delete report
        db.session.execute(delete(Report).where(Report.id == reportId))
        db.session.commit()

        return jsonify(response), 200

    else:
        return jsonify({"message": "Report no longer exists.", "report": None}), 200
