# Surge.sh Dagger Module

This Dagger module helps you publish static websites to [surge.sh](https://surge.sh).

## Prerequisites

- Dagger CLI installed
- Surge.sh account (get one at [surge.sh](https://surge.sh))

## Usage

```shell
# Get a token if you don't already have one 
dagger call -m github.com/levlaz/daggerverse/surge get-token
```

```shell
# Deploy a static site
dagger call -m github.com/levlaz/daggerverse/surge \
  --login your-email \
  --token your-token \
  --source ./public \
  --domain your-domain.surge.sh \
  publish
```

## Configuration Options

| Option | Description |
|--------|-------------|
| `--login` | Your Surge.sh email address |
| `--token` | Your Surge.sh token (get it via `surge token`) |
| `--source` | Directory containing static site files |
| `--domain` | Domain to deploy to (e.g., your-domain.surge.sh) |

## Example

Here's a complete example that deploys a static site:

```shell
dagger call -m github.com/levlaz/surge \
  --login your-email@example.com \
  --token your-surge-token \
  --source ./dist \
  --domain my-awesome-site.surge.sh \
  publish
```

## License

This project is licensed under the MIT License. See the LICENSE file for details.
