package main

import (
	"context"
)

type OpenTofu struct {
	Ctr *Container
}

func (m *OpenTofu) initBaseContainer() {
	if m.Ctr == nil {
		m.Ctr = dag.
			Container().
			From("golang:1.21-alpine").
			WithExec([]string{"apk", "add", "git"}).
			WithExec([]string{"git", "clone", "https://github.com/levlaz/opentofu"}).
			WithWorkdir("/go/opentofu").
			WithExec([]string{"go", "install", "."})
	}
}

func (m *OpenTofu) Run(ctx context.Context, command string) (*Container, error) {
	m.initBaseContainer()
	return m.Ctr.WithExec([]string{"opentofu", "-version"}).Sync(ctx)
}
