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

@object()
/**
 * Bluesky Dagger Module
 */
export class Bluesky {
  /**
   * Send post to Bluesky
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
    await rt.detectFacets(agent);
    const postRecord = {
      $type: "app.bsky.feed.post",
      text: rt.text,
      facets: rt.facets,
      createdAt: new Date().toISOString(),
    };

    const { uri } = await agent.post(postRecord);
    return uri;
  }
}
