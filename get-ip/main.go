package main

import (
	"context"
)

type GetIp struct {}

func (m *GetIp) MyFunction(ctx context.Context, stringArg string) (*Container, error) {
	return dag.Container().From("alpine:latest").WithExec([]string{"echo", stringArg}).Sync(ctx)
}
