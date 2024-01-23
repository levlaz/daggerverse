# Module: MariaDB 

Dagger Module for MariaDB Service

## CLI Examples

```sh
dagger up -m mariadb --port 3306:3306 serve
```

## API Examples 

### Go 

First, install the module. 

```sh
dagger mod install github.com/levlaz/daggerverse/mariadb
```

Return MariaDB service
```go
	// Start MariaDB Service
	mariadb := dag.Mariadb().Serve()
```