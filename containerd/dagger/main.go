// containerd utilities
//
// Collection of utility functions for containerd
package main

import (
	"dagger/containerd/internal/dagger"

	platformFormat "github.com/containerd/containerd/platforms"
)

// Containerd
type Containerd struct{}

// returns the architecture of the provided platform
func (m *Containerd) ArchitectureOf(
	// valid platform value from OCI Image Index Specification
	platform dagger.Platform,
) string {
	return platformFormat.MustParse(string(platform)).Architecture
}
