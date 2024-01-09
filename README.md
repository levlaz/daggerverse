# daggerverse
Personal Collection of Dagger Modules

| Module | Description |
|--|--|
|LaunchDarkly | Dagger Module for LaunchDarkly Code References | 
| nginx | Dagger Service Module for serving static content with nginx| 

## VS Code 

Add `go.work` file to be able to edit all of these at once and use the go lsp. 

```
go 1.21.3

use ./launchdarkly
use ./openring
use ./get-ip
use ./nginx 
use ./opentofu
```
