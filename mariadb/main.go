package main

type Mariadb struct{}

// example usage: dagger up --port 3306:3306 serve
func (m *Mariadb) Serve() *Service {
	return dag.Container().
		From("mariadb:latest").
		WithEnvVariable("MARIADB_ALLOW_EMPTY_ROOT_PASSWORD", "1").
		WithExposedPort(3306).
		AsService()
}
