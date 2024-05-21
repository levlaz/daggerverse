"""Dragonfly DB Module.

This module provides a simple way to use DragonflyDB as a part of your
CI/CD pipeline.
"""

import dagger
from dagger import dag, function, object_type


@object_type
class Dragonfly:
    @function
    def serve(self) -> dagger.Service:
        """Return DragonflyDB as service.
        example usage: dagger serve up --ports 6379:6379
        """
        return (
            dag.container()
            .from_("docker.dragonflydb.io/dragonflydb/dragonfly:latest")
            .with_exposed_port(6379)
            .as_service()
        )

    @function
    def debug(self) -> dagger.Container:
        """Return DragonflyDB container.

        example usage: dagger call debug terminal
        """
        return (
            dag.container()
            .from_("docker.dragonflydb.io/dragonflydb/dragonfly:latest")
            .with_exposed_port(6379)
            .with_entrypoint(["bash"])
        )
