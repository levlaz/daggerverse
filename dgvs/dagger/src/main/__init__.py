"""A module for working with daggerverse
"""

import dagger
from dagger import dag, function, object_type
import requests
import pprint 

@object_type
class Dgvs:
    def _get_modules(self) -> str:
        return requests.get("https://daggerverse.dev/api/refs").json()

    @function
    def stats(self) -> str:
        modules = self._get_modules()
        
        modules = list({module['path'] for module in modules})
        # modules = [module for module in modules if module['release'] != '']

        stats = {
            "first": modules[0],
            "last": modules[-1],
            "count": len(modules)
        }

        return pprint.pformat(modules, sort_dicts=False)
