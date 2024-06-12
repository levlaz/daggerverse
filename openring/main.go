// Openring Dagger Module
//
// This module allows you to generate a webring snippet for your blog using the
// openring library.
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
			WithMountedCache("/go/pkg/mod", dag.CacheVolume("openring-go-mod")).
			WithMountedCache("/go/build-cache", dag.CacheVolume("openring-go-build")).
			WithEnvVariable("GOCACHE", "/go/build-cache").
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
	// Optional HTML template file
	// +optional
	template *File,
) (*File, error) {
	m.initBaseContainer()

	if template != nil {
		res := m.Ctr.
			WithFile("sources.txt", sources).
			WithFile("in.html", template).
			WithEnvVariable("CACHEBUSTER", time.Now().String()).
			WithExec([]string{"sh", "-c", "./openring -S sources.txt < in.html > out.html"}).
			File("out.html")

		return res, nil
	}

	res := m.Ctr.
		WithFile("sources.txt", sources).
		WithEnvVariable("CACHEBUSTER", time.Now().String()).
		WithExec([]string{"sh", "-c", "./openring -S sources.txt < in.html > out.html"}).
		File("out.html")
	return res, nil
}

// Test Openring Function
func (m *Openring) Test(sources *File) *File {
	template := dag.Git("https://git.sr.ht/~levlaz/openring").
		Branch("master").
		Tree().
		File("in.html")

	f, err := m.Openring(sources, template)

	if err != nil {
		panic(err)
	}

	return f
}
