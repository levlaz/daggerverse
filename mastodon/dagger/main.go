// A Dagger module for interacting with Mastodon
//
// This module allows you to send toots directly from your Dagger pipeline.

package main

import (
	"context"
	"dagger/mastodon/internal/dagger"
	"log"

	"github.com/mattn/go-mastodon"
)

type Mastodon struct{}

// Send toot to mastodon instance
//
// Example usage: dagger call toot --server="" --client-id="" --client-secret=env:MASTODON_CLIENT_SECRET --access-token=env:MASTODON_ACCESS_TOKEN --msg="hello from the DAG"
func (m *Mastodon) Toot(
	ctx context.Context,
	// url of mastodon instance
	server string,
	// mastodon application client id
	clientId string,
	// mastodon application client secret
	clientSecret *dagger.Secret,
	// mastodon access token
	accessToken *dagger.Secret,
	// toot body
	msg string,
	// toot visibility, one of public, unlisted, private, direct
	// +optional
	// +default="public"
	visibility string,
) (string, error) {
	clientSecretValue, err := clientSecret.Plaintext(ctx)
	if err != nil {
		return "", err
	}

	accessTokenValue, err := accessToken.Plaintext(ctx)
	if err != nil {
		return "", err
	}

	c := mastodon.NewClient(&mastodon.Config{
		Server:       server,
		ClientID:     clientId,
		ClientSecret: clientSecretValue,
		AccessToken:  accessTokenValue,
	})

	toot, err := c.PostStatus(context.Background(), &mastodon.Toot{
		Status:     msg,
		Visibility: visibility,
	})
	if err != nil {
		log.Fatal(err)
	}

	return toot.URL, nil
}
