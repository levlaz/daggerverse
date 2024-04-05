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
        self
    ) -> str:
        """Parse Environment Variables and Return Dagger Cloud Trace URL"""
        full = os.getenv("TRACEPARENT")
        # TODO this is a magic number, is it always guaranteed to be this?
        if full is not None:
            trace = full.split("-")[1]
            url = f'https://dagger.cloud/traces/{trace}'
            return url 
        
        return None