// Basic tests for the Bluesky Dagger Module

import { Directory, File, Secret, argument, object, func, dag} from "@dagger.io/dagger"

@object()
export class BlueskyTest {
  @func()
  async all(
    @argument({defaultPath: "/"}) source: Directory,
  ): Promise<string> {
    const [smokeResult, unitResult] = await Promise.all([
      this.smokeTest(),
      this.unit(source)
    ]);
    let output = "";
    output += smokeResult;
    output += unitResult;
    return output;
  }
  
  @func()
  async smokeTest(): Promise<string> {
    const password: Secret = dag.setSecret("test", "test");
    try {
      // We expect this to fail
      await dag.bluesky().post("test@test.com", password, "Hello, world!");
      // If it succeeds, that's a failure
      throw new Error("Expected post to fail, but it succeeded.");
      process.exit(1)
    } catch (err: any) {
      // If it fails as expected, return a pass message
      return `smokeTest passed: ${err.message || err}`;
    }
  }

  @func()
  async unit(
    @argument({defaultPath: "/"}) source: Directory,
  ): Promise<string> {
    return await dag
      .container()
      .from("node")
      .withMountedDirectory("/src", source)
      .withWorkdir("/src/bluesky")
      .withExec(["yarn", "install"])
      .withExec(["yarn", "test:custom"])
      .stdout();
  }

  // @func()
  // async textExamples(source: Directory): Promise<string> {
  //   let output = "";
  //   for (const language of ["python", "typescript", "go", "shell"]) {
  //     output += await dag
  //       .daggerDev()
  //       .dev(language)
  //       .withMountedDirectory("/src", source)
  //       .withWorkdir("/src")
  //       .withExec([
  //         "bash",
  //         "-c",
  //         `dagger call -m examples/${language} bluesky-post`,
  //       ])
  //       .stdout();
  //   }
  //   return output;
  // }
}
