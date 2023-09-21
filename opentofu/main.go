package main

import (
	"context"
)

type Opentofu struct {}

func (m *Opentofu) MyFunction(ctx context.Context, stringArg string) (*Container, error) {
	return dag.Container().From("alpine:latest").WithExec([]string{"echo", stringArg}).Sync(ctx)
}
