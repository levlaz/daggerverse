
"""bluesky examples in Python"""
import dagger
from dagger import dag, function, object_type

@object_type
class Example:

	@function
	def bluesky_post(self) -> str:
		"""Example for post function"""
		# ideally this is passed in as a secret
		password = dag.set_secret("test", "test")

		return dag.bluesky().post("test@test.com", password, "Hello, world!")
