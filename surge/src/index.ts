/**
 * A dagger module for surge.sh
 */
import { dag, Container, Directory, Secret, object, func } from "@dagger.io/dagger"

@object()
export class Surge {
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
   * 
   * @param login - surge.sh login
   * @param token - surge.sh auth token
   * @param project - project directory with the files to publish
   */
  @func()
  publish(login: string, token: Secret, domain: string, project: Directory): Container {
    return this.base()
      .withEnvVariable("SURGE_LOGIN", login)
      .withSecretVariable("SURGE_TOKEN", token)
      .withDirectory("/src", project)
      .withWorkdir("/src")
      .withExec(["surge", "--project", "/src", "--domain", `${domain}.surge.sh`])
  }
}
