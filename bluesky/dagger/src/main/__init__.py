"""Bluesky Dagger Module 

Send posts to Bluesky from your Dagger Pipeleines
"""

import dagger
from typing import Annotated
from dagger import Doc, dag, function, object_type
from atproto import Client

@object_type
class Bluesky:
    @function
    async def post(
        self, 
        email: Annotated[str, Doc("Bluesky account email")], 
        password: Annotated[dagger.Secret, Doc("Bluesky password")], 
        text: Annotated[str, Doc("Bluesky post message body")],
        host: Annotated[str, Doc("Bluesky server url")] = "https://bsky.social",
    ) -> str:
        """Send post to Bluesky"""
        # get secret
        pwd = await password.plaintext()

        # create Bluesky session
        client = Client(base_url=host)
        client.login(email, await password.plaintext())

        post = client.send_post(text)
        
        return post.uri