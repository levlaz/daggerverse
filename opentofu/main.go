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
			WithExec([]string{"apk", "add", "curl"}).
			// WithEnvVariable("CACHEBUSTER", time.Now().String()).
			WithExec([]string{"sh", "-c", "curl --proto '=https' --tlsv1.2 -fsSL https://get.opentofu.org/install-opentofu.sh -o install-opentofu.sh"}).
			WithExec([]string{"sh", "-c", "chmod +x install-opentofu.sh"}).
			WithExec([]string{"sh", "-c", "./install-opentofu.sh --install-method apk"}).
			WithExec([]string{"rm", "install-opentofu.sh"})
	}
}

// Execute OpenTofu command
// example usage: dagger call run --command $command
func (m *OpenTofu) Run(ctx context.Context, command Optional[string]) (*Container, error) {
	cmd, isset := command.Get()

	m.initBaseContainer()

	if isset {
		return m.Ctr.WithExec([]string{"tofu", cmd}).Sync(ctx)
	}

	return m.Ctr.WithExec([]string{"tofu", "-help"}).Sync(ctx)
}

// Open interactive debug shell
// example usage: dagger shell debug
func (m *OpenTofu) Debug() *Container {
	m.initBaseContainer()

	return m.Ctr
}
