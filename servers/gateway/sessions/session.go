package sessions

import (
	"errors"
	"fmt"
	"net/http"
	"strings"
)

const headerAuthorization = "Authorization"
const paramAuthorization = "auth"
const schemeBearer = "Bearer "

//ErrNoSessionID is used when no session ID was found in the Authorization header
var ErrNoSessionID = errors.New("no session ID found in " + headerAuthorization + " header")

//ErrInvalidScheme is used when the authorization scheme is not supported
var ErrInvalidScheme = errors.New("authorization scheme not supported")

//BeginSession creates a new SessionID, saves the `sessionState` to the store, adds an
//Authorization header to the response with the SessionID, and returns the new SessionID
func BeginSession(signingKey string, store Store, sessionState interface{}, w http.ResponseWriter) (SessionID, error) {
	sessionID, err := NewSessionID(signingKey)
	if err != nil {
		return InvalidSessionID, err
	}

	err = store.Save(sessionID, sessionState)
	if err != nil {
		return InvalidSessionID, err
	}

	w.Header().Add(headerAuthorization, fmt.Sprintf("%s %s", schemeBearer, sessionID))
	return sessionID, nil
}

//GetSessionID extracts and validates the SessionID from the request headers
func GetSessionID(r *http.Request, signingKey string) (SessionID, error) {
	auth := r.Header.Get(headerAuthorization)
	if len(auth) == 0 {
		auth = r.URL.Query().Get(paramAuthorization)
	}
	if !strings.HasPrefix(auth, schemeBearer) {
		return InvalidSessionID, ErrInvalidScheme
	}
	auth_slice := strings.Fields(auth)
	signed := auth_slice[1]
	sessionID, err := ValidateID(signed, signingKey)
	if err != nil {
		return InvalidSessionID, err
	}
	return sessionID, nil
}

//GetState extracts the SessionID from the request,
//gets the associated state from the provided store into
//the `sessionState` parameter, and returns the SessionID
func GetState(r *http.Request, signingKey string, store Store, sessionState interface{}) (SessionID, error) {
	sessionID, err := GetSessionID(r, signingKey)
	if err != nil {
		return InvalidSessionID, err
	}

	err = store.Get(sessionID, sessionState)
	if err != nil {
		return InvalidSessionID, err
	}

	return sessionID, nil
}

//EndSession extracts the SessionID from the request,
//and deletes the associated data in the provided store, returning
//the extracted SessionID.
func EndSession(r *http.Request, signingKey string, store Store) (SessionID, error) {
	sessionID, err := GetSessionID(r, signingKey)
	if err != nil {
		return InvalidSessionID, err
	}

	err = store.Delete(sessionID)
	if err != nil {
		return InvalidSessionID, err
	}

	return sessionID, nil
}
