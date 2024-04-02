// MariaDB Module
//
// This module allows you to easily add MariaDB as a service
// to your pipeline.

package main

import (
	"fmt"
)

type Mariadb struct{}

// Return MariaDB Container
func (m *Mariadb) Base(
	// Version of MariaDB to use
	// +optional
	// +default="latest"
	version string,
	// Database name
	// +optional
	// +defeault="sample-database"
	dbName string,
) *Container {
	return dag.Container().
		From(fmt.Sprintf("mariadb:%s", version)).
		WithEnvVariable("MARIADB_ALLOW_EMPTY_ROOT_PASSWORD", "1").
		WithEnvVariable("MARIADB_DATABASE", dbName).
		WithExposedPort(3306)
}

// Return MariaDB as a Service
// example usage: dagger call serve up
//
// if you'd like to run on a different port then:
// dagger call serve up --ports=3308:3306
func (m *Mariadb) Serve(
	// Version of MariaDB to use
	// +optional
	// +default="latest"
	version string,
	// Database name
	// +optional
	// +default="sample-database"
	dbName string,
) *Service {
	return m.Base(version, dbName).AsService()
}

// Debug MariaDB from Client Container
//
// example usage: dagger call debug terminal
// --
// this will pop you into a shell, you can then connect to the
// mariadb container with 'mariadb -h db' and see the sample database
// with 'use sample-datbase'
func (m *Mariadb) Debug() *Container {
	return dag.Container().
		From("mariadb:latest").
		WithServiceBinding("db", m.Serve("latest", "sample-database"))
}
