//
// Docusaurus Dagger Module
//
// This module allows you to run docusaurus sites locally with Dagger
// without needing to install any additional dependencies.
//
// Example Usage:
//
// `dagger call -m github.com/levlaz/daggerverse/docusaurus serve --dir "/src/docs" --src https://github.com/kpenfound/dagger#kyle/docs-239-convert-secrets` up
//
// The example above shows how to grab a remote git branch, the basic
// structure is https://github.com/$USER/$REPO#$BRANCH. The `src` argument can
// take a local directory, but this module becomes especially
// useful when you pass in remote git repos. In particular, imagine you are trying
// to preview a PR for a docs change. You can simply pass in the git branch from
// your fork and preview the docs without needing to install any local dependencies
// or have to remember how to fetch remote branches locally.
//

package main

import (
	"fmt"
)

func New(
	// The source directory of your docusaurus site, this can be a local directory or a remote git repo
	src *Directory,
	// Optional working directory if you need to execute docusaurus commands outside of your root
	// +optional
	// +default="/src"
	dir string,
	// Optional flag to disable cache
	// +optional
	// +default=false
	disableCache bool,
	// Optional cache volume name; this is useful if you work with multiple projects
	// or have node_dependencies that are rapidly changing to avoid issues with
	// npm having failures.
	// +optional
	// +default="node-docusaurus-docs"
	cacheVolumeName string,
) *Docusaurus {
	return &Docusaurus{
		Src:             src,
		Dir:             dir,
		DisableCache:    disableCache,
		CacheVolumeName: cacheVolumeName,
	}
}

type Docusaurus struct {
	Src             *Directory
	Dir             string
	DisableCache    bool
	CacheVolumeName string
}

// Return base container for running docusaurus with docs mounted and docusaurus
// dependencies installed.
func (m *Docusaurus) Base() *Container {
	ctr := dag.Container().
		From("node:lts-alpine").
		WithoutEntrypoint().
		WithMountedDirectory("/src", m.Src).
		WithWorkdir(m.Dir)

	if !m.DisableCache {
		ctr = ctr.
			WithMountedCache(
				fmt.Sprintf("%s/node_modules", m.Dir),
				dag.CacheVolume(m.CacheVolumeName),
			).
			WithMountedCache(
				fmt.Sprintf("%s/build", m.Dir),
				dag.CacheVolume(m.CacheVolumeName),
			).
			WithMountedCache(
				"/root/.npm",
				dag.CacheVolume("node-docusaurus-root"),
			)
	}

	ctr = ctr.
		WithExposedPort(3000).
		WithExec([]string{"npm", "install"})

	return ctr
}

// Build production docs
func (m *Docusaurus) Build() *Directory {
	return m.Base().
		WithExec([]string{"npm", "run", "build"}).
		Directory("build")
}

// Serve production docs locally as a service
func (m *Docusaurus) Serve() *Service {
	return m.Base().
		WithDirectory("build", m.Build()).
		WithExec([]string{"npm", "run", "serve"}).
		AsService()
}

// Build and serve development docs as a service
func (m *Docusaurus) ServeDev() *Service {
	return m.Base().
		WithExec([]string{"npm", "start", "--", "--host", "0.0.0.0"}).
		AsService()
}
