"""Dagger Module for Developing GNOME Evolution Extensions

This module helps you develop GNOME Evolution extensions with Dagger by providing 
a clean and reproducible build environment.
"""

import dagger
import time
from dagger import dag, function, object_type


@object_type
class Evolution:
    @function
    def base(self) -> dagger.Container:
        """
        Returns a base container with the necessary tools installed.
        """
        return (
            dag
            .container()
            .from_("debian:stable")
            .with_exec(["apt-get", "update"])
            # base dependencies
            .with_exec([
                "apt-get", 
                "install", 
                "-y", 
                "wget",
                "unzip",
                "cmake"
            ])
            # evolution libraries
            .with_exec([
                "apt-get",
                "install",
                "-y",
                "evolution-dev", 
                "evolution-data-server-dev",
                "libebook1.2-dev"
            ])
        )
    
    @function
    def build_example(self) -> dagger.File:
        """
        Builds an example GNOME Evolution extension and return the shared object file.

        Modeled after the docs here: https://gitlab.gnome.org/GNOME/evolution/-/wikis/Extensions

        You can install this sample module in your local evolution by running:
            
            dagger call build-example -o ~/.local/share/evolution/modules/lib/evolution/modules/example-module.so
        """
        return (
            self
            .base()
            .with_workdir("/src")
            .with_exec(["wget", "https://gitlab.gnome.org/GNOME/evolution/-/wikis/uploads/647f60ad7026a7a68fd4bcd6ba1512cc/example-module.zip"])
            .with_exec(["unzip", "example-module.zip"])
            .with_workdir("/src/example-module/_build")
            .with_exec(["cmake", ".."])
            .with_exec(["make"])
            .file("src/libexample-module.so")
        )
