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
        output += await self.test_examples()

        return output
