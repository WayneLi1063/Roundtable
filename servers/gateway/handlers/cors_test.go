package handlers

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/go-redis/redis"
	"wayneli.me/m/servers/gateway/models/users"
	"wayneli.me/m/servers/gateway/sessions"
)

// TestServeHTTP tests if ServeHTTP in cors.go correctly returns required CORS
func TestServeHTTP(t *testing.T) {
	// initial setup
	redisaddr := os.Getenv("REDISADDR")
	if len(redisaddr) == 0 {
		redisaddr = "127.0.0.1:6379"
	}

	client := redis.NewClient(&redis.Options{
		Addr: redisaddr,
	})

	sessionsStore := sessions.NewRedisStore(client, time.Hour)

	user1 := &users.NewUser{
		Email:        "John.Smith@testing.com",
		Password:     "moreThanAdaquate",
		PasswordConf: "moreThanAdaquate",
		UserName:     "Adaquate",
		FirstName:    "John",
		LastName:     "Smith",
	}

	dsn := fmt.Sprintf("root:%s@tcp(127.0.0.1:3306)/test", os.Getenv("MYSQL_ROOT_PASSWORD"))
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()

	_, err = db.Exec("TRUNCATE TABLE Users")
	if err != nil {
		t.Fatal(err)
	}

	usersStore := users.NewMysqlStore(db)

	ctx := HandlerContext{"someRanDomKey3120", sessionsStore, usersStore}

	// 1. UsersHandler call
	// We create a ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
	rr := httptest.NewRecorder()

	b := new(bytes.Buffer)
	if err = json.NewEncoder(b).Encode(user1); err != nil {
		t.Fatal(err)
	}

	req, err := http.NewRequest(http.MethodPost, "/v1/users", b)
	if err != nil {
		t.Fatal(err)
	}

	// add content type
	req.Header.Add("Content-Type", "application/json")

	NewCORS(http.HandlerFunc(ctx.UsersHandler)).ServeHTTP(rr, req)
	authHeader := rr.Header().Get("Authorization")

	err = helperTestFunc(t, rr)
	if err != nil {
		t.Fatal(err)
	}

	// 2. SpecificUserHandler call
	rr = httptest.NewRecorder()

	newUpdate := &users.Updates{
		FirstName: "Johnny",
		LastName:  "Depp",
	}

	b = new(bytes.Buffer)
	if err = json.NewEncoder(b).Encode(newUpdate); err != nil {
		t.Fatal(err)
	}
	req, err = http.NewRequest(http.MethodPatch, "/v1/users/me", b)
	if err != nil {
		t.Fatal(err)
	}

	req.Header.Add("Content-Type", "application/json")
	req.Header.Add("Authorization", authHeader)

	NewCORS(http.HandlerFunc(ctx.SpecificUsersHandler)).ServeHTTP(rr, req)

	err = helperTestFunc(t, rr)
	if err != nil {
		t.Fatal(err)
	}

	// 3. SessionsHandler call
	rr = httptest.NewRecorder()

	cred := users.Credentials{
		Email:    "John.Smith@testing.com",
		Password: "moreThanAdaquate",
	}

	b = new(bytes.Buffer)
	if err = json.NewEncoder(b).Encode(cred); err != nil {
		t.Fatal(err)
	}
	req, err = http.NewRequest(http.MethodPost, "/v1/sessions", b)
	if err != nil {
		t.Fatal(err)
	}

	req.Header.Add("Content-Type", "application/json")
	req.Header.Add("Authorization", authHeader)

	NewCORS(http.HandlerFunc(ctx.SessionsHandler)).ServeHTTP(rr, req)

	err = helperTestFunc(t, rr)
	if err != nil {
		t.Fatal(err)
	}

	// 4. SessionsHandler call
	rr = httptest.NewRecorder()

	req, err = http.NewRequest(http.MethodPost, "/v1/sessions/mine", nil)
	if err != nil {
		t.Fatal(err)
	}

	req.Header.Add("Authorization", authHeader)

	NewCORS(http.HandlerFunc(ctx.SpecificSessionHandler)).ServeHTTP(rr, req)

	err = helperTestFunc(t, rr)
	if err != nil {
		t.Fatal(err)
	}

	// 5. OPTIONS call
	// We create a ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
	rr = httptest.NewRecorder()

	req, err = http.NewRequest(http.MethodOptions, "/v1/users", b)
	if err != nil {
		t.Fatal(err)
	}

	// add content type
	req.Header.Add("Content-Type", "application/json")

	NewCORS(http.HandlerFunc(ctx.UsersHandler)).ServeHTTP(rr, req)
	authHeader = rr.Header().Get("Authorization")

	err = helperTestFunc(t, rr)
	if err != nil {
		t.Fatal(err)
	}

	// Check the status code is what we expect.
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v",
			status, http.StatusOK)
	}

}

// This is a helper function to help check if the CORS headers are correct
func helperTestFunc(t *testing.T, rr *httptest.ResponseRecorder) error {
	corsACAO := rr.Header().Get("Access-Control-Allow-Origin")
	if corsACAO != "*" {
		t.Errorf("handler returned CORS: got %v want %v",
			corsACAO, "*")
		return errors.New("Did not find CORS header")
	}
	corsACAM := rr.Header().Get("Access-Control-Allow-Methods")
	if corsACAM != "GET, PUT, POST, PATCH, DELETE" {
		t.Errorf("handler returned CORS: got %v want %v",
			corsACAM, "GET, PUT, POST, PATCH, DELETE")
		return errors.New("Did not find CORS header")
	}
	corsACAH := rr.Header().Get("Access-Control-Allow-Headers")
	if corsACAH != "Content-Type, Authorization" {
		t.Errorf("handler returned CORS: got %v want %v",
			corsACAH, "Content-Type, Authorization")
		return errors.New("Did not find CORS header")
	}
	corsACEH := rr.Header().Get("Access-Control-Expose-Headers")
	if corsACEH != "Authorization" {
		t.Errorf("handler returned CORS: got %v want %v",
			corsACEH, "Authorization")
		return errors.New("Did not find CORS header")
	}
	corsACMA := rr.Header().Get("Access-Control-Max-Age")
	if corsACMA != "600" {
		t.Errorf("handler returned CORS: got %v want %v",
			corsACMA, "600")
		return errors.New("Did not find CORS header")
	}
	return nil
}
