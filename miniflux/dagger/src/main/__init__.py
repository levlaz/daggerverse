"""Dagger module for working with the miniflux API

This module implements the miniflux python library.
https://miniflux.app/docs/api.html
"""

import dagger
import miniflux

from typing import Annotated
from dagger import dag, function, object_type, Doc
from jinja2 import Template

# uncomment below to enable debug logging
import logging
from dagger.log import configure_logging
configure_logging(logging.DEBUG)


@object_type
class Miniflux:
    host: Annotated[str, Doc("url for miniflux instance")] = "https://miniflux.app"
    token: Annotated[dagger.Secret, Doc("miniflux API token")]
    category_id: Annotated[
        str | None,
        Doc("optional, category id for blogroll, if not set will grab all feeds."),
    ]

    async def _get_feeds(self) -> list:
        """Return list of feeds from miniflux server"""
        client = miniflux.Client(self.host, api_key=await self.token.plaintext())

        if self.category_id is None:
            feeds = client.get_feeds()
        else:
            feeds = client.get_category_feeds(self.category_id)

        return feeds
    
    async def _get_starred(
            self, 
            direction: Annotated[str, Doc("order to retrieve posts")],
            limit: Annotated[int, Doc("number of posts to return")],
        ) -> list:
        """Return list of starred posts from miniflux server"""
        client = miniflux.Client(self.host, api_key=await self.token.plaintext())

        entries = client.get_entries(
            starred=True,
            direction=direction,
            limit=limit)

        return entries

    @function
    async def generate_sources(self) -> dagger.File:
        """Generate sources file for openring

        This function grabs all the feeds from a given category in miniflux,
        grabs the feed_url and then generates a sources.txt file for the
        purpose of feeding it into the openring module.

        https://daggerverse.dev/mod/github.com/levlaz/daggerverse/openring@39958eb474dcb1922439b2a829be6af71d6bc263#Openring.openring
        """
        urls = [feed["feed_url"] for feed in await self._get_feeds()]

        with open("sources.txt", "w") as f:
            for url in urls:
                f.write(f"{url}\n")

        return dag.current_module().workdir_file("sources.txt")

    @function
    async def generate_blogroll(self) -> dagger.File:
        """Generate blogroll template

        This function uses the Jinja templating library to create a blog roll
        list that you can embed in your own website based on the blogs you
        read in miniflux.
        """
        template = Template("""
        <h3>Blogroll</h3>
        <ul>
            {% for site in sites %}
                <li>
                    <a href="{{ site.url }}">{{ site.title }}</a>
                </li>
            {% endfor %}
        </ul>               
        """)

        sites = [
            {"url": site["site_url"], "title": site["title"]}
            for site in await self._get_feeds()
        ]

        with open("blogroll.html", "w") as f:
            f.write(template.render(sites=sites))

        return dag.current_module().workdir_file("blogroll.html")

    @function
    async def generate_starred(
        self,
        heading: Annotated[
            str, Doc("section heading text")
        ] = "Recent Favorite Blog Posts",
        direction: Annotated[str, Doc("Order to retrieve posts, desc or asc")] = "desc",
        limit: Annotated[int, Doc("number of posts to return")] = 10,
    ) -> dagger.File:
        """Generate list of starred posts

        This function generates a file of links for your starred posts, by default
        you will get the 10 most recent.
        """
        template = Template("""
        <p><b>{{ heading }}</b></p>
        <p> This is a collection of the last {{ limit }} posts that I bookmarked.</p>
        <ul>
            {% for post in posts %}
            <li>
                <a href="{{ post.url }}">{{ post.title }}</a> from {{ post.feed.title }}
            </li>
            {% endfor %}
        </ul>
        """)
        starred = await self._get_starred(direction=direction, limit=limit)

        with open("starred.html", "w") as f:
            f.write(template.render(
                posts=starred["entries"],
                heading=heading,
                limit=limit)
            )

        return dag.current_module().workdir_file("starred.html")
