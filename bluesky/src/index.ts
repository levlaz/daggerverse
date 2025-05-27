/**
 * Bluesky Dagger Module
 *
 * Send posts to Bluesky from your Dagger pipelines. Can connect to any Bluesky instance but defaults to the public instance at https://bsky.social.
 */
import {
  dag,
  Container,
  Directory,
  object,
  func,
  Secret,
} from "@dagger.io/dagger";
import { AtpAgent, RichText } from "@atproto/api";
import { chunkAndPost, chunkText } from '@/lib/bluesky-chunker';

/**
 * Bluesky Dagger Module
 */
@object()
export class Bluesky {
  /**
   * Send post to Bluesky, if longer than 300 characters, it will be chunked into multiple posts.
   * 
   * @param email - Email address of the Bluesky account
   * @param password - Password of the Bluesky account, should be a Dagger Secret
   * @param text - Content to post on Bluesky
   * @param host - Host of the Bluesky instance, defaults to the public instance
   * 
   * @returns JSON string of posts
   */
  @func()
  async post(
    email: string,
    password: Secret,
    text: string,
    host = "https://bsky.social",
  ): Promise<string> {
    const agent = new AtpAgent({ service: host });

    await agent.login({
      identifier: email,
      password: await password.plaintext(),
    });

    const rt = new RichText({ text });
    await rt.detectFacets();

    const posts  = await chunkAndPost(agent, rt)

    return JSON.stringify(posts, null, 2)
  }
}