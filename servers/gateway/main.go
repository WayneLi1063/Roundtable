package main

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"

	"github.com/go-redis/redis"
	"wayneli.me/m/servers/gateway/handlers"
	"wayneli.me/m/servers/gateway/models/users"
	"wayneli.me/m/servers/gateway/sessions"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

// Director is the director used for routing to microservices
type Director func(r *http.Request)

// CustomDirector forwards to the microservice and passes it the current user.
func CustomDirector(targets []*url.URL, ctx *handlers.HandlerContext) Director {
	var counter int32
	counter = 0
	mutex := sync.Mutex{}
	return func(r *http.Request) {
		mutex.Lock()
		defer mutex.Unlock()
		targ := targets[counter%int32(len(targets))]
		atomic.AddInt32(&counter, 1)
		r.Header.Add("X-Forwarded-Host", r.Host)
		r.Header.Del("X-User")
		sessionState := &handlers.SessionState{}
		_, err := sessions.GetState(r, ctx.SigningKey, ctx.SessionsStore, sessionState)
		// If there is an error, forward it to the API to deal with it.
		if err != nil {
			r.Header.Add("X-User", "{}")
		} else {
			user := sessionState.User
			userJSON, err := json.Marshal(user)
			if err != nil {
				r.Header.Add("X-User", "{}")
			} else {
				r.Header.Add("X-User", string(userJSON))
			}
		}
		r.Host = targ.Host
		r.URL.Host = targ.Host
		r.URL.Scheme = targ.Scheme
	}
}

// This function parses the string into a slice of URLs
func getURLs(addrString string) []*url.URL {
	addrsSplit := strings.Split(addrString, ",")
	URLs := make([]*url.URL, len(addrsSplit))
	for i, c := range addrsSplit {
		URL, err := url.Parse(c)
		if err != nil {
			log.Fatal(fmt.Printf("Failure to parse url %v", err))
		}
		URLs[i] = URL
	}
	return URLs
}

var upgrader = websocket.Upgrader{}

//main is the main entry point for the server
func main() {

	e := echo.New()

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Logger.Fatal(e.Start(":8080"))

	e.GET("/ws", func(c echo.Context) error {
		upgrader.CheckOrigin = func(r *http.Request) bool { return true }

		ws, err := upgrader.Upgrade(c.Response().Writer, c.Request(), nil)
		if !errors.Is(err, nil) {
			log.Println(err)
		}
		defer ws.Close()

		log.Println("Connected!")

		return nil
	})

	/////////////////////////////////////////////////////////////////////////
	addr := os.Getenv("ADDR")

	if len(addr) == 0 {
		addr = ":443"
	}

	sessionKey := os.Getenv("SESSIONKEY")
	redisAddr := os.Getenv("REDISADDR")
	DSN := os.Getenv("DSN")

	rdClient := redis.NewClient(&redis.Options{
		Addr:     redisAddr,
		Password: "",
		DB:       0,
	})

	rdStore := sessions.NewRedisStore(rdClient, time.Hour)

	msDB, err := sql.Open("mysql", DSN)
	if err != nil {
		fmt.Println("error occured when openning database")
		return
	}

	msStore := users.NewMysqlStore(msDB)

	ctx := handlers.NewHandlerContext(sessionKey, rdStore, msStore)

	tlscert := os.Getenv("TLSCERT")
	tlskey := os.Getenv("TLSKEY")

	rtr := mux.NewRouter()

	rtr.HandleFunc("/v1/users", ctx.UsersHandler)
	rtr.HandleFunc("/v1/users/{ID}", ctx.SpecificUsersHandler)
	rtr.HandleFunc("/v1/sessions", ctx.SessionsHandler)
	rtr.HandleFunc("/v1/sessions/{ID}", ctx.SpecificSessionHandler)

	// Create URLs for proxies
	groupsAddrs := os.Getenv("GROUPSADDRS")
	groupsURLs := getURLs(groupsAddrs)
	groupsProxy := &httputil.ReverseProxy{Director: CustomDirector(groupsURLs, ctx)}

	rtr.Handle("/v1/groups", groupsProxy)
	rtr.Handle("/v1/groups/{groupID}", groupsProxy)
	rtr.Handle("/v1/groups/{groupID}/members", groupsProxy)
	rtr.Handle("/v1/courses/users", groupsProxy)

	wrappedMux := handlers.NewCORS(rtr)

	log.Printf("server is listening at %s...", addr)
	log.Fatal(http.ListenAndServeTLS(addr, tlscert, tlskey, wrappedMux))
}
