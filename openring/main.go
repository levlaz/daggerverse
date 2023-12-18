package main

import (
	"time"
)

type Openring struct {
	Ctr *Container
}

func (m *Openring) initBaseContainer() {
	if m.Ctr == nil {
		m.Ctr = dag.
			Container().
			From("golang:alpine").
			WithExec([]string{"apk", "add", "git"}).
			WithExec([]string{"apk", "add", "tree"}).
			WithExec([]string{"git", "clone", "https://git.sr.ht/~sircmpwn/openring"}).
			WithWorkdir("openring").
			WithExec([]string{"go", "build"})
	}
}

// Generate Openring snippet
func (m *Openring) Openring(
	// File containing list of feeds to include
	sources *File,
) (*File, error) {
	m.initBaseContainer()
	res := m.Ctr.
		WithFile("sources.txt", sources).
		WithEnvVariable("CACHEBUSTER", time.Now().String()).
		WithExec([]string{"sh", "-c", "./openring -S sources.txt < in.html > out.html"}).
		File("out.html")
	return res, nil
}
