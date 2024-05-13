/**
 * Docusaurus Dagger Module
 *
 * This module allows you to run docusaurus sites locally with Dagger
 * without needing to install any additional dependencies.
 * 
 * Example Usage:
 * 
 * `dagger call -m github.com/levlaz/daggerverse/docusaurus run --dir "/src/docs" --src https://github.com/kpenfound/dagger#kyle/docs-239-convert-secrets as-service up`
 * 
 * The example above shows how to grab a remote git branch, the basic 
 * structure is https://github.com/$USER/$REPO#$BRANCH. The `src` argument can 
 * take a local directory, but this module becomes especially 
 * useful when you pass in remote git repos. In particular, imagine you are trying 
 * to preview a PR for a docs change. You can simply pass in the git branch from 
 * your fork and preview the docs without needing to install any local dependencies 
 * or have to remember how to fetch remote branches locally. 
 * 
 * Since our run function returns a dagger `Container` type, we can run it as a 
 * service by chaining `as-service up` to the end of our invocation.
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
      .withMountedCache(
        `${dir}/node_modules`,
        dag.cacheVolume("node-docusaurus-docs"),
      )
      .withMountedCache("/root/.npm", dag.cacheVolume("node-docusaurus-root"))
      .withExposedPort(3000)
      .withExec(["npm", "install"])
      .withExec(["npm", "start", "--", "--host", "0.0.0.0"])
  }
}
