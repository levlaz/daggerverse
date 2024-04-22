// Mutli Channel Notifications for CI with Novu
//
// This module allows you to send multi-channel notifications from your
// Dagger pipeline using [Novu](https://novu.co/). The open source notification
// infrastructure platform.

package main

import (
	"context"
	"fmt"

	novu "github.com/novuhq/go-novu/lib"
)

type Novu struct{}

// trigger notification via Novu
func (m *Novu) Notify(
	// Novu subscriber ID
	subscriber string,
	// Novu API token
	token *Secret,
	// Novu event Id
	event string,
	// Message body for notification
	msg string,
) (string, error) {
	ctx := context.Background()

	to := map[string]interface{}{
		"subscriberId": subscriber,
	}

	payload := map[string]interface{}{
		"msg": msg,
	}

	tokenValue, err := token.Plaintext(ctx)
	if err != nil {
		return "", err
	}

	novuClient := novu.NewAPIClient(tokenValue, &novu.Config{})
	triggerResp, err := novuClient.EventApi.Trigger(ctx, event, novu.ITriggerPayloadOptions{
		To:      to,
		Payload: payload,
	})
	if err != nil {
		return "", err
	}

	return fmt.Sprintln(triggerResp), nil
}
