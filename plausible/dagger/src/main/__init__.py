"""Plausible Analytics Module

This module allows you to interact with the Plausible analytics API
as a part of your Dagger pipeline. Right now it only implements the 
stats API, but in the future we may also include events.
"""

import json
from typing import Annotated

import requests

import dagger
from dagger import Doc, dag, function, object_type

# uncomment to enable debug logging
# import logging
# from dagger.log import configure_logging
# configure_logging(logging.DEBUG)
# logger = logging.getLogger(__name__)

@object_type
class Plausible:
    """
    Plausible functions
    """

    host: Annotated[str, Doc("Plausible Server Address")]
    site_id: Annotated[str, Doc("Plausibnle Site ID")]
    token: Annotated[dagger.Secret, Doc("Plausible API Token")]

    @function
    async def top_pages(self) -> str:
        """Show 25 top pages from this month"""
        payload = {
            "site_id": self.site_id,
            "period": "30d",
            "property": "event:page",
            "limit": "25"
        }
        headers = {"Authorization": f"Bearer {await self.token.plaintext()}"}
        resp = requests.get(
            f"{self.host}/api/v1/stats/breakdown", 
            params=payload,
            headers=headers
        )
        return json.dumps(resp.json(), indent=2)
