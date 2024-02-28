# Module: MariaDB 

Dagger Module for MariaDB Service

## CLI Examples

```sh
dagger call serve up --ports=3308:3306
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