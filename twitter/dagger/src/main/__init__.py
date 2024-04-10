"""Send Tweets from your Dagger Pipeline"""

import sys
import tweepy
import dagger 
from typing import Annotated
from dagger import function, object_type, Doc


@object_type
class Twitter:
    @function
    async def tweet(self, 
              text: Annotated[str, Doc("Tweet content")],
              # these are from the Consumer Keys section of
              # https://developer.twitter.com/
              consumer_key: Annotated[dagger.Secret, Doc("Twitter Consumer Key")],
              consumer_secret: Annotated[dagger.Secret, Doc("Twitter Consumer Secret")],
              # these are from the "Authentication Tokens" section of 
              # https://developer.twitter.com/ must have read, write, and 
              # DM permissions
              auth_token: Annotated[dagger.Secret, Doc("Twitter API User Access Token")],
              auth_secret: Annotated[dagger.Secret, Doc("Twitter API User Access Secret")],
              bearer_token: Annotated[dagger.Secret, Doc("Twitter API Bearer Token")],
        ) -> str:
        """Send Tweet
        
        getting this to actually work with auth is a huge PITA, but this comment 
        saves us:https://github.com/Significant-Gravitas/AutoGPT/issues/2194#issuecomment-1513626102 
        """
        client = tweepy.Client(bearer_token = await bearer_token.plaintext(),
                               consumer_key = await consumer_key.plaintext(),
                               consumer_secret = await consumer_secret.plaintext(),
                               access_token = await auth_token.plaintext(),
                               access_token_secret = await auth_secret.plaintext())
        
        try:
            resp = client.create_tweet(text=text)
            return str(resp.data)
        except tweepy.TweepyException as e:
            print("Error sending tweet: {}".format(e))
            sys.exit(1) 
