/**
 * Docusaurus Dagger Module
 *
 * This module allows you to run docusaurus sites locally with Dagger
 * without needing to install any additional dependencies.
 */

import { dag, Container, Directory, object, func } from "@dagger.io/dagger"

@object()
class Docusaurus {
  /**
   * Run docs site locally
   * 
   * @param src The source directory of your docusaurus site, this can be a local directory or a remote git repo
   * @param dir Optional working directory if you need to execute docusaurus commands outside of your root
   */
  @func()
  run(src: Directory, dir = "/src"): Container {
    return dag
      .container()
      .from("node:lts-alpine")
      .withMountedDirectory("/src", src)
      .withWorkdir(dir)
      .withExposedPort(3000)
      .withExec(["npm", "install"])
      .withExec(["npm", "start", "--", "--host", "0.0.0.0"])
  }
}
