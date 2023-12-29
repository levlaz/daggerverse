import dagger
from dagger import dag, function
from datetime import datetime

# Directory where composer vendor binaries can be found.
VENDOR_BIN = "/home/vapor/.composer/vendor/bin"


def vapor_base() -> dagger.Container:
    """Creates Vapor Base Image.
    
    Creates a Vapor base image that includes all packages and dependencies
    needed for downstream steps in pipeline. Uses a mounted volume to cache 
    composer packages.

    Returns:
        A dagger.Container with all dependencies installed. 
    """
    # use volume for composer packages
    composerCache = dag.cache_volume("vapor_composer")

    # use multi stage build to grab composer binary and pass it along
    composer = (
        dag.container()
        .from_("composer:latest")
    )

    return (
        dag.container()
        .from_("php:latest")
        .with_file("/usr/bin/composer", composer.file("/usr/bin/composer"))
        # install debian packages
        .with_exec(["apt-get", "update"])
        .with_exec(["apt-get", "install", "-y", "git", "tree", "unzip", "libzip-dev"])
        # install php extensions
        .with_exec(["docker-php-ext-install", "zip"])
        .with_exec(["useradd", "vapor"])
        .with_user("vapor")
        .with_workdir("/home/vapor")
        .with_mounted_cache("/home/vapor/.composer", composerCache, owner="vapor")
        .with_exec(["sh", "-c", "composer global require laravel/vapor-cli --update-with-dependencies"])
        .with_exec(["sh", "-c", "composer require laravel/vapor-core --update-with-dependencies"])
    )


@function
def vapor_list() -> str:
    """List available vapor commands.
    
    This function is never cached since we always want to see output.

    Returns:
        String with output of vapor list command.
    """
    return (
        vapor_base()
        .with_env_variable("CACHEBUSTER", str(datetime.now()))
        .with_workdir(VENDOR_BIN)
        .with_exec(["php", "vapor", "list"])
        .stdout()
    )