/**
 * LinkedIn Module
 *
 * This module allows you to interacte with the LinkedIn API from a Dagger
 * pipeline.
 *
 */

import {
  dag,
  Container,
  Directory,
  object,
  func,
  Secret,
} from "@dagger.io/dagger";
import { RestliClient } from "linkedin-api-client";

@object()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Linkedin {
  /**
   * Post message to LinkedIn
   *
   * Example usage: dagger call post --token env:LINKEDIN_TOKEN --text "hello"
   *
   * More information on how to get started with the LinkedIn
   * API can be found here: https://github.com/linkedin-developers/linkedin-api-js-client?tab=readme-ov-file#pre-requisites
   *
   * @param token LinkedIn 3-legged access token
   * @param text Body of LinkedIn message
   */
  @func()
  async post(token: Secret, text: string): Promise<string> {
    const restliClient = new RestliClient();

    const user_response = await restliClient.get({
      resourcePath: "/userinfo",
      accessToken: await token.plaintext(),
    });

    const response = await restliClient.create({
      resourcePath: "/posts",
      entity: {
        author: `urn:li:person:${user_response.data.sub}`,
        lifecycleState: "PUBLISHED",
        visibility: "PUBLIC",
        commentary: text,
        distribution: {
          feedDistribution: "MAIN_FEED",
          targetEntities: [],
          thirdPartyDistributionChannels: [],
        },
      },
      accessToken: await token.plaintext(),
    });

    return JSON.stringify(response.createdEntityId);
  }

  @func()
  async debug(source: Directory): Promise<Container> {
    return dag.container().from("node:lts").withDirectory("/src", source);
  }
}
