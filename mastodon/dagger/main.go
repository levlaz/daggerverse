// A Dagger module for interacting with Mastodon
//
// This module allows you to send toots directly from your Dagger pipeline.

package main

import (
	"context"
	"log"

	"github.com/mattn/go-mastodon"
)

type Mastodon struct{}

// Send toot to mastodon instance
func (m *Mastodon) Toot(
	ctx context.Context,
	// url of mastodon instance
	server string,
	// mastodon application client id
	clientId string,
	// mastodon application client secret
	clientSecret *Secret,
	// mastodon access token
	accessToken *Secret,
	// toot body
	msg string,
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
		Status: msg,
	})
	if err != nil {
		log.Fatal(err)
	}

	return toot.URL, nil
}
