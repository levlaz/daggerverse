/**
 * A dagger module for working with Cloudflare Wrangler
 *
 * This is a simple CLI wrapper for Cloudflare Wrangler that also allows you to easily
 * parameterize the API token, node version, and project directory.
 *
 */
import { dag, Container, Directory, Secret, object, func, argument } from "@dagger.io/dagger"

@object()
export class Wrangler {
  apiToken: Secret
  nodeVersion: string 
  projectDir: Directory
  projectName: string
  branch: string

  constructor(
    apiToken: Secret, 
    @argument ({defaultPath: "/" }) projectDir: Directory, 
    nodeVersion?: string,
    projectName?: string,
    branch?: string
  ) {
    this.apiToken = apiToken
    this.projectDir = projectDir
    this.nodeVersion = nodeVersion ?? "latest"
    this.projectName = projectName ?? "default"
    this.branch = branch ?? "main"
  }

  /**
   * Base Container with Node and Wrangler installed
   */
  @func()
  async base(): Promise<Container> {
    return dag
      .container()
      .from(`node:${this.nodeVersion}`)
      .withSecretVariable("CLOUDFLARE_API_TOKEN", this.apiToken)
      .withExec(["npm", "install", "-g", "wrangler"])
  }

  /**
   * Deploy the project to Cloudflare
   * 
   * note: project must already exist. There is no way to create a new project 
   * non-interactively using Wrangler.
   */
  @func()
  async deploy(): Promise<string> {
    const container = await this.base()

    return container
      .withMountedDirectory("/src", this.projectDir)
      .withWorkdir("/src")
      .withExec(["wrangler", "pages", "deploy", "--project-name", this.projectName, "--branch", this.branch, "."])
      .stdout()
  }
}
