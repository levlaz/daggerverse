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
	"context"
	"fmt"
)

type Docusaurus struct{}

// Return container for running docusaurus with docs mounted.
func (m *Docusaurus) Build(
	// The source directory of your docusaurus site, this can be a local directory or a remote git repo
	src *Directory,
	// Optional working directory if you need to execute docusaurus commands outside of your root
	// +optional
	// +default="/src"
	dir string,
) *Container {
	return dag.
		Container().
		From("node:lts-alpine").
		WithMountedDirectory("/src", src).
		WithWorkdir(dir).
		WithMountedCache(
			fmt.Sprintf("%s/node_modules", dir),
			dag.CacheVolume("node-docusaurus-docs"),
		).
		WithMountedCache(
			"/root/.npm",
			dag.CacheVolume("node-docusaurus-root"),
		).
		WithExposedPort(3000).
		WithExec([]string{"npm", "install"})
}

// Run docs site locally
func (m *Docusaurus) Serve(
	ctx context.Context,
	// The source directory of your docusaurus site, this can be a local directory or a remote git repo
	src *Directory,
	// Optional working directory if you need to execute docusaurus commands outside of your root
	// +optional
	// +default="/src"
	dir string,
) *Service {
	return m.Build(src, dir).
		WithExec([]string{"npm", "start", "--", "--host", "0.0.0.0"}).
		AsService()
}
