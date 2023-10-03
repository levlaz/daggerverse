package main

import "time"

type GetIp struct {
	Ctr *Container
}

func (m *GetIp) initBaseContainer() {
	if m.Ctr == nil {
		m.Ctr = dag.
			Container().
			From("alpine:latest").
			WithExec([]string{"apk", "add", "bind-tools"})
	}
}

func (m *GetIp) Run() *Container {
	m.initBaseContainer()
	return m.Ctr.
		WithEnvVariable("CACHEBUSTER", time.Now().String()).
		WithExec([]string{"env"}).
		WithExec([]string{"dig", "+short", "myip.opendns.com", "@resolver1.opendns.com"})
}
