"""Tests for DragonflyDB Module
"""

import dagger
from dagger import dag, function, object_type

# NOTE: it's recommended to move your code into other files in this package
# and keep __init__.py for imports only, according to Python's convention.
# The only requirement is that Dagger needs to be able to import a package
# called "main", so as long as the files are imported here, they should be
# available to Dagger.


@object_type
class Tests:
    @function 
    async def all(self) -> str:
        """Run all tests."""
        results = []

        results.append(await self.test_dragonfly_service())

        return str(results)
    
    @function
    async def test_dragonfly_service(self) -> bool:
        dragonfly = dag.dragonfly().serve()

        ctr = await (
            dag
            .container()
            .from_("alpine:latest")
            .with_service_binding("df", dragonfly)
            .with_exec(["apk", "add", "redis"])
            .with_exec(["redis-cli", "-h", "df", "set", "key1", "123"])
            .with_exec(["redis-cli", "-h", "df", "get", "key1"])
            .stdout()
        )

        return ctr.rstrip() == "123"
