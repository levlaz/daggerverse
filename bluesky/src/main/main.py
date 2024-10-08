"""Bluesky Dagger Module

Send posts to Bluesky from your Dagger Pipelines
"""

import dagger
from typing import Annotated
from dagger import Doc, dag, function, object_type
from atproto import Client

@object_type
class Bluesky:
    """Dagger Module for interacting with the BlueSky API"""
    @function
    async def post(
        self,
        email: Annotated[str, Doc("Bluesky account email")],
        password: Annotated[dagger.Secret, Doc("Bluesky password")],
        text: Annotated[str, Doc("Bluesky post message body")],
        host: Annotated[str, Doc("Bluesky server url")] = "https://bsky.social",
    ) -> str:
        """Send post to Bluesky"""
        # create Bluesky session
        client = Client(base_url=host)
        client.login(email, await password.plaintext())

        # post message
        post = client.send_post(text)

        return post.uri
