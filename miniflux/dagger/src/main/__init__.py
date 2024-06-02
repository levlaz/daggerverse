"""Dagger module for working with the miniflux API

This module implements the miniflux python library.
https://miniflux.app/docs/api.html
"""

import dagger
import miniflux

from typing import Annotated
from dagger import dag, function, object_type, Doc

# uncomment below to enable debug logging
# import logging
# from dagger.log import configure_logging
# configure_logging(logging.DEBUG)


@object_type
class Miniflux:
    host: Annotated[str, Doc("url for miniflux instance")] = "https://miniflux.app"
    token: Annotated[dagger.Secret, Doc("miniflux API token")]
    category_id: Annotated[
        str | None,
        Doc("optional, category id for blogroll, if not set will grab all feeds."),
    ]

    @function
    async def generate_sources(self) -> dagger.File:
        """Generate sources file for openring

        This function grabs all the feeds from a given category in miniflux,
        grabs the feed_url and then generates a sources.txt file for the
        purpose of feeding it into the openring module.

        https://daggerverse.dev/mod/github.com/levlaz/daggerverse/openring@39958eb474dcb1922439b2a829be6af71d6bc263#Openring.openring
        """
        client = miniflux.Client(self.host, api_key=await self.token.plaintext())

        if self.category_id is None:
            feeds = client.get_feeds()
        else:
            feeds = client.get_category_feeds(self.category_id)

        urls = [feed["feed_url"] for feed in feeds]

        with open("sources.txt", "w") as f:
            for url in urls:
                f.write(f"{url}\n")

        return await dag.current_module().workdir_file("sources.txt")
