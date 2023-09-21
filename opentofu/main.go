package main

import (
	"context"
)

type OpenTofu struct {}

func (m *OpenTofu) MyFunction(ctx context.Context, stringArg string) (*Container, error) {
	return dag.Container().From("alpine:latest").WithExec([]string{"echo", stringArg}).Sync(ctx)
}
