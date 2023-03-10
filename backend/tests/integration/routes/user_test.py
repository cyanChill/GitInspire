import collections
import pytest
import webtest

from tests import testBase
from server.models.User import User


class User_Route_Test(testBase.TestBase):
    def assert_response(self, response, expected_users):
        """
        A helper method that asserts whether an HTTP response includes the
        suspected User ids
        """
        actual_ids = [tag["name"] for tag in response]
        expected_ids = [tag["name"] for tag in expected_users]
        self.assertCountEqual(actual_ids, expected_ids)

    @pytest.mark.skip(reason="Not implemented.")
    def test_get_user(self):
        pass

    @pytest.mark.skip(reason="Not implemented.")
    def test_get_users(self):
        pass

    @pytest.mark.skip(reason="Not implemented.")
    def test_refresh_user(self):
        pass
    
    @pytest.mark.skip(reason="Not implemented.")
    def test_get_user_contributions(self):
        pass
    
    @pytest.mark.skip(reason="Not implemented.")
    def test_delete_user(self):
        pass
