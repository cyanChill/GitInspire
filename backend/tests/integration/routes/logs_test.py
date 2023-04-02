from datetime import datetime

from tests import testBase
from server.db import db
from server.models.Log import Log


class Repository_Route_Test(testBase.TestBase):
    def assert_response_strict(self, response, expected_logs):
        """
        A helper method that asserts whether an HTTP response includes the
        suspected Log ids (order matters)
        """
        actual_ids = [log["id"] for log in response]
        expected_ids = [log["id"] for log in expected_logs]
        self.assertEqual(actual_ids, expected_ids)

    def test_filter_repositories(self):
        with self.app.app_context():
            # Create dummy logs
            log_1 = Log(
                id=1,
                action="resolve",
                type="repository",
                content_id="394012075",
                enacted_by=0,
                created_at=datetime.strptime(
                    "2022-01-01T21:49:19Z", "%Y-%m-%dT%H:%M:%SZ"
                ),
            )
            log_2 = Log(
                id=2,
                action="dismiss",
                type="tag",
                content_id="project_idea",
                enacted_by=0,
                created_at=datetime.strptime(
                    "3021-04-28T21:49:19Z", "%Y-%m-%dT%H:%M:%SZ"
                ),
            )
            db.session.add_all([log_1, log_2])

            # Set authorization token to be an admin user
            self.webtest_app.authorization = ("Bearer", self.user_admin_token)

            response = self.webtest_app.get("/api/logs?page=1").json
            self.assertEqual(response["message"], "Found results.")
            self.assertEqual(response["currPage"], 1)
            self.assert_response_strict(
                response["logs"], [log_2.as_dict(), log_1.as_dict()]
            )
