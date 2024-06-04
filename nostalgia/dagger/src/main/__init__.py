"""
The Nostalgia RSS parser 

This module parses RSS Feeds to help you be more nostalgic.
"""

import pprint
from datetime import date
from typing import Annotated

import requests
from bs4 import BeautifulSoup
from dateutil import parser

import dagger
from dagger import Doc, dag, function, object_type

# uncomment to enable debug logging
# import logging
# from dagger.log import configure_logging
# configure_logging(logging.DEBUG)
# logger = logging.getLogger(__name__)


@object_type
class Nostalgia:
    """
    Nostalgia functions
    """

    feed_url: Annotated[str, Doc("URL for RSS feed XML")]

    def _get_pub_date(self, post: str) -> tuple[date, date]:
        """Parse item and return (month, day) tuple"""
        return (
            parser.parse(post.pubDate.text).date().month,
            parser.parse(post.pubDate.text).date().day,
        )

    def _get_years_ago(self, post: str) -> str:
        """Parse item and return formatted string of years since publishing"""
        years = date.today().year - parser.parse(post.pubDate.text).date().year
        return f"{years} years ago"
    
    def _get_feed(self) -> BeautifulSoup:
        """Parse feed and return BeautifulSoup object"""
        feed = requests.get(self.feed_url)
        bs = BeautifulSoup(feed.content, "xml")
        return bs

    @function
    def today(self) -> str:
        """Pretty print posts from today over the years"""
        today = date.today()
        posts = self._get_feed().find_all("item")

        # for testing specific date
        # today = date(2024, 12, 7)

        p = [
            {
                "title": post.title.text,
                "url": post.link.text,
                "date": post.pubDate.text,
                "year_ago": self._get_years_ago(post),
            }
            for post in posts
            if (self._get_pub_date(post) == (today.month, today.day))
        ]

        return pprint.pformat(p)
    
    @function
    def stats(self) -> str:
        """Pretty Print basic statistics about this feed"""
        feed = self._get_feed()

        return pprint.pformat({
            'title': feed.find('channel').title.text,
            'link': feed.find('channel').link.text,
            'post_count': len(feed.find_all('item')),
            'first': feed.find_all('item')[-1].pubDate.text,
            'last': feed.find_all('item')[0].pubDate.text
        }, sort_dicts=False)