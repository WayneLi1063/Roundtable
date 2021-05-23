package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/go-redis/redis"
	"wayneli.me/m/servers/gateway/handlers"
	"wayneli.me/m/servers/gateway/models/users"
	"wayneli.me/m/servers/gateway/sessions"
)

//main is the main entry point for the server
func main() {
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

	mux := http.NewServeMux()

	mux.HandleFunc("/v1/users", ctx.UsersHandler)
	mux.HandleFunc("/v1/users/", ctx.SpecificUsersHandler)
	mux.HandleFunc("/v1/sessions", ctx.SessionsHandler)
	mux.HandleFunc("/v1/sessions/", ctx.SpecificSessionHandler)

	wrappedMux := handlers.NewCORS(mux)

	log.Printf("server is listening at %s...", addr)
	log.Fatal(http.ListenAndServeTLS(addr, tlscert, tlskey, wrappedMux))
}
