package main

import (
	"context"
)

type Mariadb struct{}

// example usage: "dagger call container-echo --string-arg yo"
func (m *Mariadb) ContainerEcho(stringArg string) *Container {
	return dag.Container().From("alpine:latest").WithExec([]string{"echo", stringArg})
}

// example usage: "dagger call grep-dir --directory-arg . --pattern GrepDir"
func (m *Mariadb) GrepDir(ctx context.Context, directoryArg *Directory, pattern string) (string, error) {
	return dag.Container().
		From("alpine:latest").
		WithMountedDirectory("/mnt", directoryArg).
		WithWorkdir("/mnt").
		WithExec([]string{"grep", "-R", pattern, "."}).
		Stdout(ctx)
}
