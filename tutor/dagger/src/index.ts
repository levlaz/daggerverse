/**
 * Dagger Tutor
 *
 * An interactive dagger module for learning dagger.
 */

import { dag, Container, Directory, object, func } from "@dagger.io/dagger";
import { Messages } from "./messages";

@object()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Tutor {
  /**
   * Return a welcome prompt.
   */
  @func()
  async start(): Promise<string> {
    return dag
      .container()
      .from("alpine:latest")
      .withExec(["echo", Messages.welcomeMessage])
      .stdout();
  }

  /**
   * Run through Dagger Tutor at a specific step.
   */
  @func()
  async tutor(step: string): Promise<string> {
    let msg = "";
    switch (step) {
      case "2": {
        msg = Messages.step2;
      }
    }

    return dag
      .container()
      .from("alpine:latest")
      .withExec(["echo", msg])
      .stdout();
  }
}
