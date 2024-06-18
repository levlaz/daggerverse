// Openring Dagger Module
//
// This module allows you to generate a webring snippet for your blog using the
// openring library.

package main

type Openring struct{}

// return base image with openring
func (m *Openring) base() *Container {
	return dag.
		Container().
		From("golang:1.22-alpine").
		WithMountedCache("/go/pkg/mod", dag.CacheVolume("openring-go-mod")).
		WithMountedCache("/go/build-cache", dag.CacheVolume("openring-go-build")).
		WithEnvVariable("GOCACHE", "/go/build-cache").
		WithExec([]string{"apk", "add", "git"}).
		WithExec([]string{"apk", "add", "tree"}).
		WithExec([]string{"git", "clone", "https://git.sr.ht/~sircmpwn/openring"}).
		WithWorkdir("openring").
		WithExec([]string{"go", "build"})
}

// generate openring snippet
func (m *Openring) Openring(
	// File containing list of feeds to include
	sources *File,
	// Optional HTML template file
	// +optional
	template *File,
) *File {
	if template != nil {
		return m.base().
			WithFile("sources.txt", sources).
			WithFile("in.html", template).
			WithExec([]string{"sh", "-c", "./openring -S sources.txt < in.html > out.html"}).
			File("out.html")
	}

	return m.base().
		WithFile("sources.txt", sources).
		WithExec([]string{"sh", "-c", "./openring -S sources.txt < in.html > out.html"}).
		File("out.html")
}

// Test for Openring Function
func (m *Openring) Test(sources *File) *File {
	template := dag.Git("https://git.sr.ht/~levlaz/openring").
		Branch("master").
		Tree().
		File("in.html")

	return m.Openring(sources, template)
}
