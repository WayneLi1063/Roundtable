package handlers

import (
	"time"

	"wayneli.me/m/servers/gateway/models/users"
)

// This is the struct declaration for SessionState
type SessionState struct {
	StartTime time.Time   `json:"startTime"`
	User      *users.User `json:"user"`
}
