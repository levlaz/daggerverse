"""Collection of Useful Utilities for working with Dagger Cloud
"""

import dagger
import os
from typing import Annotated
from dagger import dag, function, object_type, Doc


@object_type
class CloudUtils:
    @function
    def trace_url(
        self,
        # TODO org would be better if dagger login worked, I would grab it from 
        # that context instead of needing to pass it in like this.
        org: Annotated[str, Doc("Dagger Cloud Org Name")]
    ) -> str:
        """Parse Environment Variables and Return Dagger Cloud Trace URL"""
        full = os.getenv("TRACEPARENT")
        # TODO this is a magic number, is it always guaranteed to be this?
        if full is not None:
            trace = full.split("-")[1]
            url = f'https://dagger.cloud/{org}/traces/{trace}'
            return url 
        
        return None