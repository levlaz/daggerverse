"""
Basic tests for the Bluesky Dagger Module
"""

import dagger
from dagger import dag, function, object_type, DefaultPath
from typing import Annotated

@object_type
class BlueskyTest:
    @function
    async def smoke_test(self) -> str:
        password = dag.set_secret("test", "test")
        return await dag.bluesky().post("test@test.com", password, "Hello, world!")
           
    @function
    async def all(self) -> str:
        output = ""
        output += await self.smoke_test()

        return output

    @function
    async def text_examples(self, source: dagger.Directory) -> str:
        output = ""
        for language in ["python", "typescript", "go", "shell"]:
            output += await (
                dag.
                dagger_dev().
                dev(language).
                with_mounted_directory("/src", source).
                with_workdir("/src").
                with_exec(["bash", "-c", f"dagger call -m examples/{language} bluesky-post"]).
                stdout()
            )

        return output
