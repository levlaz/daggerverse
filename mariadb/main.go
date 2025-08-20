// MariaDB Module
//
// This module allows you to easily add MariaDB as a service
// to your pipeline.

package main

import (
	"fmt"
	"mariadb/internal/dagger"
)

type Mariadb struct {
	Version    string
	DbName     string
	DbUser     string
	DbPassword string
}

func New(
	// Version of MariaDB to use
	// +optional
	// +default="latest"
	version string,
	// Database name
	// +optional
	// +default="sample-database"
	dbName string,
	// Database Username
	// +optional
	dbUser string,
	// Database Password
	// +optional
	dbPassword string,
) *Mariadb {
	return &Mariadb{
		Version:    version,
		DbName:     dbName,
		DbUser:     dbUser,
		DbPassword: dbPassword,
	}
}

// Return MariaDB Container
func (m *Mariadb) Base() *dagger.Container {
	return dag.Container().
		From(fmt.Sprintf("mariadb:%s", m.Version)).
		WithEnvVariable("MARIADB_ALLOW_EMPTY_ROOT_PASSWORD", "1").
		WithEnvVariable("MARIADB_DATABASE", m.DbName).
		WithEnvVariable("MARIADB_USER", m.DbUser).
		WithEnvVariable("MARIADB_PASSWORD", m.DbPassword).
		WithExposedPort(3306)
}

// Return MariaDB as a Service
// example usage: dagger call serve up
//
// if you'd like to run on a different port then:
// dagger call serve up --ports=3308:3306
func (m *Mariadb) Serve() *dagger.Service {
	return m.Base().AsService()
}

// Debug MariaDB from Client Container
//
// example usage: dagger call debug terminal
// example usage without defaults: dagger --version latest --db-name foo --db-user bar --db-password baz call debug terminal
//
// this will pop you into a shell, you can then connect to the
// mariadb container with `mariadb -h db` and see the sample database
// with `use sample-datbase`, you  may need to add `--skip-ssl` if the mariadb
// client complains about ERROR 2026 (HY000): TLS/SSL error: self-signed certificate
func (m *Mariadb) Debug() *dagger.Container {
	return dag.Container().
		From("mariadb:latest").
		WithServiceBinding("db", m.Serve())
}
