# Module: LaunchDarkly 

Dagger Module for LaunchDarkly Code References

## CLI Examples

### Find Code References

```sh
dagger call -m github.com/levlaz/daggerverse/launchdarkly \
    find --token $LD_ACCESS_TOKEN --project $LD_PROJ_KEY --repo $LD_REPO_NAME --directory .
```
