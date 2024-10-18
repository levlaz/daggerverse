
// Bluesky examples in Go
package main

import (
	"context"
)

type Example struct{}


// Example for Post function
func (m *Example) Bluesky_Post (ctx context.Context) (string, error) {
	// ideally this is passed in as a secret
	password := dag.SetSecret("test", "test")
	return dag.Bluesky().Post(ctx, "test@test.com", password, "Hello, world!")
}


