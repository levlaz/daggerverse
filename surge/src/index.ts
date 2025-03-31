/**
 * A dagger module for surge.sh
 */
import { dag, Container, Directory, Secret, object, func } from "@dagger.io/dagger"

@object()
export class Surge {
  login: string
  token: Secret
  domain: string
  project: Directory

  /**
   * @param login - surge.sh login
   * @param token - surge.sh auth token
   * @param domain - domain to publish to
   * @param project - project directory with the files to publish
   */
  constructor(login?: string, token?: Secret, domain?: string, project?: Directory) {
    this.login = login
    this.token = token
    this.domain = domain
    this.project = project
  }

  /**
   * Return base image with surge installed
   */
  @func()
  base(): Container {
    return dag
      .container()
      .from("node:lts")
      .withExec(["npm", "install", "-g", "surge"])
  }

  /**
   * Get token interactively
   */
  @func()
  getToken(): Container {
    return this.base().terminal({cmd: ["surge", "token"]})
  }

  /**
   * Publish directory to surge.sh
   */
  @func()
  publish(): Container {
    return this.base()
      .withEnvVariable("SURGE_LOGIN", this.login)
      .withSecretVariable("SURGE_TOKEN", this.token)
      .withDirectory("/src", this.project)
      .withWorkdir("/src")
      .withExec(["surge", "--project", "/src", "--domain", `${this.domain}.surge.sh`])
  }
}
