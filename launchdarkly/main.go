package main

import (
	"context"
	"fmt"
	"launchdarkly/internal/dagger"
)

type Launchdarkly struct {
	// LaunchDarkly Container version (default: latest)
	LaunchdarklyVersion string
	// LaunchDarkly token
	Token *dagger.Secret
	// LaunchDarkly directory to scan (dir)
	Directory *dagger.Directory
	// LaunchDarkly project id (projKey)
	Project string
	// LaunchDarkly repo name (repoName)
	Repo string
}

// example usage: "dagger call find --token $LD_ACCESS_TOKEN --project $LD_PROJ_KEY --repo $LD_REPO_NAME --directory ."
func (m *Launchdarkly) Find(ctx context.Context,
	// LaunchDarkly Container version (default: latest)
	// +optional
	// +default="latest"
	launchdarklyVersion string,
	// LaunchDarkly token
	token *dagger.Secret,
	// LaunchDarkly directory to scan
	directory *dagger.Directory,
	// LaunchDarkly project id
	project string,
	// LaunchDarkly repo name
	repo string,
) (string, error) {
	ld := &Launchdarkly{
		LaunchdarklyVersion: launchdarklyVersion,
		Token:               token,
		Project:             project,
		Repo:                repo,
		Directory:           directory,
	}
	return find(ctx, ld)
}

func find(ctx context.Context, ld *Launchdarkly) (string, error) {
	args := []string{"ld-find-code-refs", "--dir", "."}
	ldImage := fmt.Sprintf("launchdarkly/ld-find-code-refs:%s", ld.LaunchdarklyVersion)

	container := dag.Container().
		From(ldImage).
		WithMountedDirectory("/mnt", ld.Directory).
		WithEnvVariable("LD_PROJ_KEY", ld.Project).
		WithEnvVariable("LD_REPO_NAME", ld.Repo).
		WithSecretVariable("LD_ACCESS_TOKEN", ld.Token).
		WithWorkdir("/mnt")

	return container.
		WithExec(args, dagger.ContainerWithExecOpts{UseEntrypoint: false}).
		Stdout(ctx)
}
