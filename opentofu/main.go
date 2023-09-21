package main

import (
	"context"
)

type OpenTofu struct {
	Ctr *Container
}

func (m *OpenTofu) initBaseContainer() {
	if m.Ctr == nil {
		m.Ctr = dag.Container().From("golang:1.21-alpine")
		m.Ctr = m.Ctr.WithExec([]string{"echo 'TEST'"})
	}
}

func (m *OpenTofu) Run(ctx context.Context, command string) (*Container, error) {
	m.initBaseContainer()
	return m.Ctr.WithExec([]string{"echo", command}).Sync(ctx)
}
