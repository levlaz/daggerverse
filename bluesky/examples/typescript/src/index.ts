
// bluesky examples in TypeScript
import { dag, object, func } from "@dagger.io/dagger";

@object()
class Example {

	/**
	 * example for post function
	 */
	@func()
	blueskyPost() {
		// ideally this is passed in as a secret
		const password = dag.setSecret("test", "test");
		
		return dag.bluesky().post("test@test.com", password, "Hello, world!");
	}

}
