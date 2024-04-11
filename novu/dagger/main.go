// Mutli Channel Notifications for CI with Novu
// https://novu.co/

package main

import (
	"context"
	"fmt"
	"log"

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
) string {
	ctx := context.Background()

	to := map[string]interface{}{
		"subscriberId": subscriber,
	}

	payload := map[string]interface{}{
		"msg": msg,
	}

	tokenValue, err := token.Plaintext(ctx)
	if err != nil {
		return ""
	}

	novuClient := novu.NewAPIClient(tokenValue, &novu.Config{})
	triggerResp, err := novuClient.EventApi.Trigger(ctx, event, novu.ITriggerPayloadOptions{
		To:      to,
		Payload: payload,
	})
	if err != nil {
		log.Fatal("Novu error", err.Error())
		// return "novu error"
	}

	return fmt.Sprintln(triggerResp)
}
