package main

import (
	"context"
)

type GetSecret struct{}

// example usage: "dagger call container-echo --string-arg yo"
func (m *GetSecret) Echo(token *Secret) *Container {
	return dag.Container().From("alpine:latest").WithExec([]string{"echo", *token.plaintext})
}

// example usage: "dagger call grep-dir --directory-arg . --pattern GrepDir"
func (m *GetSecret) GrepDir(ctx context.Context, directoryArg *Directory, pattern string) (string, error) {
	return dag.Container().
		From("alpine:latest").
		WithMountedDirectory("/mnt", directoryArg).
		WithWorkdir("/mnt").
		WithExec([]string{"grep", "-R", pattern, "."}).
		Stdout(ctx)
}
