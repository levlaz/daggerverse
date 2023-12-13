# Module: LaunchDarkly 

Dagger Module for LaunchDarkly Code References

## CLI Examples

### Find Code References

```sh
dagger call -m github.com/levlaz/daggerverse/launchdarkly \
    find --token $LD_ACCESS_TOKEN --project $LD_PROJ_KEY --repo $LD_REPO_NAME --directory .
```

## API Examples 

### Go 

First, install the module. 

```sh
dagger mod install github.com/levlaz/daggerverse/launchdarkly
```

This example runs a scan as a part of a broader pipeline. 
```go
	// Scan for Code References
	ldOut, err := dag.Launchdarkly().Find(ctx, token, dir, PROJECT, REPO)
	if err != nil {
		return "", err
	}
```