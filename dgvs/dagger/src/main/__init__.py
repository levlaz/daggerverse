"""Daggerverse Module

Collection of functions for working wth the Daggerverse

warning: this module uses undocumented APIs that are subject to break at any
moment. Proceed at your own risk.
"""

import dagger
from dagger import dag, function, object_type
import requests
import pprint

@object_type
class Dgvs:
    """Dagger module for interacting with Daggerverse"""
    def _get_modules(self) -> str:
        """Return list of all modules"""
        return requests.get("https://daggerverse.dev/api/refs").json()

    @function
    def stats(self) -> str:
        """Return pretty printed report of module stats"""
        modules = self._get_modules()

        modules = list({module['path'] for module in modules})

        stats = {
            "first": modules[0],
            "last": modules[-1],
            "count": len(modules)
        }

        return pprint.pformat(modules, sort_dicts=False)
