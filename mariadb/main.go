// MariaDB Module
//
// This module allows you to easily add MariaDB as a service
// to your pipeline.

package main

import (
	"fmt"
)

type Mariadb struct{}

// Return MariaDB as a Service
// example usage: dagger call serve up
//
// if you'd like to run on a different port then:
// dagger call serve up --ports=3308:3306
func (m *Mariadb) Serve(
	// +optional
	// +default="latest"
	version string,
) *Service {
	return dag.Container().
		From(fmt.Sprintf("mariadb:%s", version)).
		WithEnvVariable("MARIADB_ALLOW_EMPTY_ROOT_PASSWORD", "1").
		WithExposedPort(3306).
		AsService()
}
