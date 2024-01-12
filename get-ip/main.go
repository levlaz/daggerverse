package main

import (
	"context"
	"time"
)

type GetIp struct {
	Ctr *Container
}

// Get IP Address of Current Container
// example usage: dagger call run
func (m *GetIp) Run(ctx context.Context) (string, error) {
	return dag.
		Container().
		From("alpine:latest").
		WithExec([]string{"apk", "add", "curl"}).
		WithEnvVariable("CACHEBUSTER", time.Now().String()).
		WithExec([]string{"curl", "https://api.ipify.org/"}).
		Stdout(ctx)
}
