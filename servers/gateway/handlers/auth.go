package handlers

import (
	"encoding/json"
	"net/http"
	"path"
	"strconv"
	"strings"
	"time"

	"wayneli.me/m/servers/gateway/models/users"
	"wayneli.me/m/servers/gateway/sessions"
)

//Creates a new HandlerContext with a signing key a sessionsStore and a usersStore
func NewHandlerContext(key string, sessionsStore sessions.Store, usersStore users.Store) *HandlerContext {
	return &HandlerContext{key, sessionsStore, usersStore}
}

// This is a handler for creating a new user.
func (ctx *HandlerContext) UsersHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Request method must be POST.", http.StatusMethodNotAllowed)
		return
	} else {
		if !strings.HasPrefix(r.Header.Get("Content-Type"), "application/json") {
			http.Error(w, "Request body must be in JSON.", http.StatusUnsupportedMediaType)
			return
		} else {
			newUser := &users.NewUser{}

			err := json.NewDecoder(r.Body).Decode(&newUser)
			if err != nil {
				http.Error(w, "Bad Request, cannot decode JSON", http.StatusBadRequest)
				return
			}

			user, err := newUser.ToUser()
			if err != nil {
				http.Error(w, "Bad Request, failed to validate new user", http.StatusBadRequest)
				return
			}

			user, err = ctx.UsersStore.Insert(user)
			if err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}

			newSession := &SessionState{time.Now(), user}

			_, err = sessions.BeginSession(ctx.SigningKey, ctx.SessionsStore, newSession, w)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			w.Header().Add("Content-Type", "application/json")
			w.WriteHeader(http.StatusCreated)
			err = json.NewEncoder(w).Encode(user)
			if err != nil {
				http.Error(w, "Internal Server Error, failed to output json", http.StatusInternalServerError)
				return
			}
		}
	}
}

// This is a handler for getting user info or updating a particular user's info.
func (ctx *HandlerContext) SpecificUsersHandler(w http.ResponseWriter, r *http.Request) {
	tempSessionState := &SessionState{}
	sessionID, err := sessions.GetState(r, ctx.SigningKey, ctx.SessionsStore, tempSessionState)
	if sessionID == "" || err != nil {
		http.Error(w, "You are not authenticated.", http.StatusUnauthorized)
		return
	}
	path := path.Base(r.URL.Path)
	userID := int64(0)
	if path == "me" {
		userID = tempSessionState.User.ID
	} else {
		userID, err = strconv.ParseInt(path, 10, 64)
		if err != nil {
			http.Error(w, "Bad Request, user ID likely not valid", http.StatusBadRequest)
			return
		}
	}
	// If the request method is get, look up user info and
	// encode it as JSON and respond.
	user := &users.User{}
	if r.Method == http.MethodGet {
		user, err = ctx.UsersStore.GetByID(userID)
		if err != nil {
			http.Error(w, "Could not find user", http.StatusNotFound)
			return
		}
		// If the request method is patch, update user info given request's info
		// and pass the updated user info as JSON back to the user.
	} else if r.Method == http.MethodPatch {
		if userID != tempSessionState.User.ID {
			http.Error(w, "You do not have the authorization to access this information", http.StatusForbidden)
			return
		}
		if !strings.HasPrefix(r.Header.Get("Content-Type"), "application/json") {
			http.Error(w, "Request body must be in JSON.", http.StatusUnsupportedMediaType)
			return
		}

		newUpdates := &users.Updates{}

		err := json.NewDecoder(r.Body).Decode(&newUpdates)
		if err != nil {
			http.Error(w, "Bad Request, update info is likely not valid.", http.StatusBadRequest)
			return
		}

		user, err = ctx.UsersStore.Update(userID, newUpdates)
		if err != nil {
			http.Error(w, "Bad Request, update info is likely not valid.", http.StatusBadRequest)
			return
		}
	} else {
		http.Error(w, "Request method must be GET or PATCH.", http.StatusMethodNotAllowed)
		return
	}

	w.Header().Add("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	err = json.NewEncoder(w).Encode(user)
	if err != nil {
		http.Error(w, "Internal Server Error, cannot encode json", http.StatusInternalServerError)
		return
	}
}

//This is a session handler
func (ctx *HandlerContext) SessionsHandler(w http.ResponseWriter, r *http.Request) {
	//Check if the response method is POST, if not
	if r.Method == http.MethodPost {
		//Checks if the content is json
		if !strings.HasPrefix(r.Header.Get("Content-Type"), "application/json") {
			http.Error(w, "Media not supported, body must be json", http.StatusUnsupportedMediaType)
			return
		}
		//Gets the body and decode it into a user credential struct
		b := r.Body
		cred := users.Credentials{}
		err := json.NewDecoder(b).Decode(&cred)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		//Find the user in the database by credential email
		usr, err1 := ctx.UsersStore.GetByEmail(cred.Email)
		if err1 != nil {
			time.Sleep(400 * time.Millisecond)
			http.Error(w, "Invalid credentials", http.StatusUnauthorized)
			return
		}
		//Try to Authenticate the user
		err2 := usr.Authenticate(cred.Password)
		if err2 != nil {
			time.Sleep(400 * time.Millisecond)
			http.Error(w, "Invalid credentials", http.StatusUnauthorized)
			return
		}

		//retrives the ip address of the login
		ips := r.Header.Get("x-forwared-for")
		ipaddr := ""
		if ips != "" {
			ipaddr = strings.Split(ips, ", ")[0]
		} else {
			ipaddr = r.RemoteAddr
		}

		//logs the login attempt into the database
		ctx.UsersStore.Log(usr.ID, ipaddr)

		sessionState := SessionState{
			time.Now(),
			usr,
		}

		_, err3 := sessions.BeginSession(ctx.SigningKey, ctx.SessionsStore, sessionState, w)

		if err3 != nil {
			http.Error(w, "failed to Begin session", http.StatusBadGateway)
			return
		}

		usrProfile, err4 := json.Marshal(usr)

		if err4 != nil {
			http.Error(w, "failed to return user", http.StatusBadGateway)
			return
		}

		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		w.Write(usrProfile)
		return
	} else {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
}

//This is a Handler for a Specific Session used for ending it
func (ctx *HandlerContext) SpecificSessionHandler(w http.ResponseWriter, r *http.Request) {
	//Check if the method is delete
	if r.Method != http.MethodDelete {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	//Check if the resource path ends with mine to ensure we are at the current session
	pathEnd := path.Base(r.URL.Path)
	if pathEnd != "mine" {
		http.Error(w, "Status is forbidden", http.StatusForbidden)
		return
	}

	//Ends the session
	_, err := sessions.EndSession(r, ctx.SigningKey, ctx.SessionsStore)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	//Writes "Signed-out"
	w.Write([]byte("signed out"))
}
