package main

type Nginx struct{}

// example usage: "dagger up --port 8080:80 serve --directory ."
func (m *Nginx) Serve(directory *Directory) *Service {
	return dag.Container().From("nginx:1.23-alpine").
		WithDirectory("/usr/share/nginx/html", directory).
		WithExposedPort(80).
		AsService()
}
