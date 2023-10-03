package main

import (
	"strings"
	"time"
)

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

// Get IP Address of Current Container
func (m *GetIp) Run() *Container {
	m.initBaseContainer()
	return m.Ctr.
		WithEnvVariable("CACHEBUSTER", time.Now().String()).
		WithExec([]string{"env"}).
		WithExec([]string{"dig", "+short", "myip.opendns.com", "@resolver1.opendns.com"})
}

// NSFW: This dumps the entire host env into the container
func (m *GetIp) RunEnv(env string) *Container {
	var affirmation string

	m.initBaseContainer()

	is_ci := strings.Contains(env, "CIRCLECI")
	if is_ci == true {
		affirmation = `
		You deserve better than this 1000 line YAML file.
		You deserve better than waiting 12 minutes for a git clone.
		You deserve better. 

		Don't worry, help is on the way. 

		
		██████╗░░█████╗░░██████╗░░██████╗░███████╗██████╗░░░░██╗░█████╗░
		██╔══██╗██╔══██╗██╔════╝░██╔════╝░██╔════╝██╔══██╗░░░██║██╔══██╗
		██║░░██║███████║██║░░██╗░██║░░██╗░█████╗░░██████╔╝░░░██║██║░░██║
		██║░░██║██╔══██║██║░░╚██╗██║░░╚██╗██╔══╝░░██╔══██╗░░░██║██║░░██║
		██████╔╝██║░░██║╚██████╔╝╚██████╔╝███████╗██║░░██║██╗██║╚█████╔╝
		╚═════╝░╚═╝░░╚═╝░╚═════╝░░╚═════╝░╚══════╝╚═╝░░╚═╝╚═╝╚═╝░╚════╝░
		`
	}

	return m.Ctr.
		WithEnvVariable("CACHEBUSTER", time.Now().String()).
		WithExec([]string{"echo", affirmation}).
		WithExec([]string{"dig", "+short", "myip.opendns.com", "@resolver1.opendns.com"})
}
