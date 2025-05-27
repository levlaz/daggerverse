/**
 * Bluesky Dagger Module
 *
 * Send posts to Bluesky from your Dagger pipelines
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
    const richChunks = chunkText(rt);


    const posts  = await chunkAndPost(agent, rt)

    return JSON.stringify(posts, null, 2)
  }
}