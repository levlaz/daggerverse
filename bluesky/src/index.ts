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

@object()
/**
 * Bluesky Dagger Module
 */
export class Bluesky {
  /**
   * Send post to Bluesky, if longer than 300 characters, it will be chunked into multiple posts.
   * @returns JSON string of posts
   */
  @func()
  async post(
    // Email address of the Bluesky account
    email: string,
    // Password of the Bluesky account, should be a Dagger Secret
    password: Secret,
    // Content to post on Bluesky
    text: string,
    // Host of the Bluesky instance, defaults to the public instance
    host = "https://bsky.social",
  ): Promise<string> {
    const agent = new AtpAgent({ service: host });

    await agent.login({
      identifier: email,
      password: await password.plaintext(),
    });

    const rt = new RichText({ text });
    await rt.detectFacets();
    const richChunks = chunkText(rt);


    const posts  = await chunkAndPost(agent, rt)

    return JSON.stringify(posts, null, 2)
  }
}