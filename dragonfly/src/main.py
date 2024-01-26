import dagger
from dagger import dag, function

@function
def serve() -> dagger.Service:
    # Example usage: dagger up --port 6379:6379 serve 
    return (
        dag.container()
        .from_("docker.dragonflydb.io/dragonflydb/dragonfly:latest")
        .with_exposed_port(6379)
        .as_service()
    )

@function
def debug() -> dagger.Container:
    # Example usage: dagger shell debug
    return (
        dag.container()
        .from_("docker.dragonflydb.io/dragonflydb/dragonfly:latest")
        .with_entrypoint(["bash"])
    )