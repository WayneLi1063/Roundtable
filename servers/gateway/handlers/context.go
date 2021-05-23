package handlers

import (
	"wayneli.me/m/servers/gateway/models/users"
	"wayneli.me/m/servers/gateway/sessions"
)

// This is the struct declaration for HandlerContext
type HandlerContext struct {
	signingKey    string
	sessionsStore sessions.Store
	usersStore    users.Store
}
