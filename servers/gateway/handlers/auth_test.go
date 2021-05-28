package handlers

import (
	"bytes"
	"crypto/md5"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"reflect"
	"strings"
	"testing"
	"time"

	"github.com/go-redis/redis"
	_ "github.com/go-sql-driver/mysql"
	"wayneli.me/m/servers/gateway/models/users"
	"wayneli.me/m/servers/gateway/sessions"
)

//gravatarBasePhotoURL is the base URL for Gravatar image requests.
//See https://id.gravatar.com/site/implement/images/ for details
const gravatarBasePhotoURL = "https://www.gravatar.com/avatar/"

// This tests the SessionsHandler in auth.go
func TestSessionsHandler(t *testing.T) {

	emailHash := md5.Sum([]byte(strings.ToLower("John.Smith@testing.com")))

	redisaddr := os.Getenv("REDISADDR")

	if len(redisaddr) == 0 {
		redisaddr = "localhost:6379"
	}

	client := redis.NewClient(&redis.Options{
		Addr: redisaddr,
	})

	defer client.Close()

	sessionsStore := sessions.NewRedisStore(client, time.Hour)

	dsn := fmt.Sprintf("root:%s@tcp(localhost:3306)/test", os.Getenv("MYSQL_ROOT_PASSWORD"))
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		t.Fatal(err)
	}

	defer db.Close()

	usersStore := users.NewMysqlStore(db)

	ctx := HandlerContext{"someRanDomKey3120", sessionsStore, usersStore}

	cases := []struct {
		name               string
		requestMethod      string
		contentType        string
		newUser            *users.NewUser
		expectedUser       *users.User
		credentials        *users.Credentials
		expectedError      bool
		expectedStatusCode int
	}{
		{
			"Valid request",
			http.MethodPost,
			"application/json; charset=UTF-8",
			&users.NewUser{
				Email:        "John.Smith@testing.com",
				Password:     "moreThanAdaquate",
				PasswordConf: "moreThanAdaquate",
				UserName:     "Adaquate",
				FirstName:    "John",
				LastName:     "Smith",
			},
			&users.User{
				ID:        1,
				UserName:  "Adaquate",
				FirstName: "John",
				LastName:  "Smith",
				PhotoURL:  gravatarBasePhotoURL + fmt.Sprintf("%x", emailHash[:]),
			},
			&users.Credentials{
				Email:    "John.Smith@testing.com",
				Password: "moreThanAdaquate",
			},
			false,
			http.StatusCreated,
		},
		{
			"Valid request 2",
			http.MethodPost,
			"application/json",
			&users.NewUser{
				Email:        "John.Smith@testing.com",
				Password:     "moreThanAdaquate",
				PasswordConf: "moreThanAdaquate",
				UserName:     "Adaquate",
				FirstName:    "John",
				LastName:     "Smith",
			},
			&users.User{
				ID:        1,
				UserName:  "Adaquate",
				FirstName: "John",
				LastName:  "Smith",
				PhotoURL:  gravatarBasePhotoURL + fmt.Sprintf("%x", emailHash[:]),
			},
			&users.Credentials{
				Email:    "John.Smith@testing.com",
				Password: "moreThanAdaquate",
			},
			false,
			http.StatusCreated,
		},
		{
			"Error case: wrong request method",
			http.MethodGet,
			"application/json; charset=UTF-8",
			&users.NewUser{
				Email:        "John.Smith@testing.com",
				Password:     "moreThanAdaquate",
				PasswordConf: "moreThanAdaquate",
				UserName:     "Adaquate",
				FirstName:    "John",
				LastName:     "Smith",
			},
			&users.User{
				ID:        1,
				UserName:  "Adaquate",
				FirstName: "John",
				LastName:  "Smith",
				PhotoURL:  gravatarBasePhotoURL + fmt.Sprintf("%x", emailHash[:]),
			},
			&users.Credentials{
				Email:    "John.Smith@testing.com",
				Password: "moreThanAdaquate",
			},
			true,
			http.StatusMethodNotAllowed,
		},
		{
			"Error case: wrong content type",
			http.MethodPost,
			"text/html",
			&users.NewUser{
				Email:        "John.Smith@testing.com",
				Password:     "moreThanAdaquate",
				PasswordConf: "moreThanAdaquate",
				UserName:     "Adaquate",
				FirstName:    "John",
				LastName:     "Smith",
			},
			&users.User{
				ID:        1,
				UserName:  "Adaquate",
				FirstName: "John",
				LastName:  "Smith",
				PhotoURL:  gravatarBasePhotoURL + fmt.Sprintf("%x", emailHash[:]),
			},
			&users.Credentials{
				Email:    "John.Smith@testing.com",
				Password: "moreThanAdaquate",
			},
			true,
			http.StatusUnsupportedMediaType,
		},
		{
			"Error case: user not authorized",
			http.MethodPost,
			"application/json; charset=UTF-8",
			&users.NewUser{
				Email:        "John.Smith@testing.com",
				Password:     "moreThanAdaquate",
				PasswordConf: "moreThanAdaquate",
				UserName:     "Adaquate",
				FirstName:    "John",
				LastName:     "Smith",
			},
			&users.User{
				ID:        1,
				UserName:  "Adaquate",
				FirstName: "John",
				LastName:  "Smith",
				PhotoURL:  gravatarBasePhotoURL + fmt.Sprintf("%x", emailHash[:]),
			},
			&users.Credentials{
				Email:    "John.Smith@testing.com",
				Password: "NotAdaquate",
			},
			true,
			http.StatusUnauthorized,
		},
		{
			"Error case: user not authorized, bad email",
			http.MethodPost,
			"application/json; charset=UTF-8",
			&users.NewUser{
				Email:        "John.Smith@testing.com",
				Password:     "moreThanAdaquate",
				PasswordConf: "moreThanAdaquate",
				UserName:     "Adaquate",
				FirstName:    "John",
				LastName:     "Smith",
			},
			&users.User{
				ID:        1,
				UserName:  "Adaquate",
				FirstName: "John",
				LastName:  "Smith",
				PhotoURL:  gravatarBasePhotoURL + fmt.Sprintf("%x", emailHash[:]),
			},
			&users.Credentials{
				Email:    "John.Smith@testing@com",
				Password: "Adaquate",
			},
			true,
			http.StatusUnauthorized,
		},
		{
			"Error case, bad JSON",
			http.MethodPost,
			"application/json; charset=UTF-8",
			&users.NewUser{
				Email:        "John.Smith@testing.com",
				Password:     "moreThanAdaquate",
				PasswordConf: "moreThanAdaquate",
				UserName:     "Adaquate",
				FirstName:    "John",
				LastName:     "Smith",
			},
			&users.User{
				ID:        1,
				UserName:  "Adaquate",
				FirstName: "John",
				LastName:  "Smith",
				PhotoURL:  gravatarBasePhotoURL + fmt.Sprintf("%x", emailHash[:]),
			},
			&users.Credentials{
				Email:    "John.Smith@testing.com",
				Password: "moreThanAdaquate",
			},
			true,
			http.StatusBadRequest,
		},
		{
			"Error case, connection to session db lost",
			http.MethodPost,
			"application/json; charset=UTF-8",
			&users.NewUser{
				Email:        "John.Smith@testing.com",
				Password:     "moreThanAdaquate",
				PasswordConf: "moreThanAdaquate",
				UserName:     "Adaquate",
				FirstName:    "John",
				LastName:     "Smith",
			},
			&users.User{
				ID:        1,
				UserName:  "Adaquate",
				FirstName: "John",
				LastName:  "Smith",
				PhotoURL:  gravatarBasePhotoURL + fmt.Sprintf("%x", emailHash[:]),
			},
			&users.Credentials{
				Email:    "John.Smith@testing.com",
				Password: "moreThanAdaquate",
			},
			true,
			http.StatusBadGateway,
		},
	}
	for _, c := range cases {
		_, err = db.Exec("TRUNCATE TABLE Users")
		if err != nil {
			t.Fatal(err)
		}

		//populate the database with one user
		b := new(bytes.Buffer)
		if err := json.NewEncoder(b).Encode(c.newUser); err != nil {
			t.Fatal(err)
		}
		req, err := http.NewRequest(http.MethodPost, "/v1/users", b)
		if err != nil {
			t.Fatal(err)
		}
		req.Header.Add("Content-Type", "application/json")
		rr := httptest.NewRecorder()
		http.HandlerFunc(ctx.UsersHandler).ServeHTTP(rr, req)
		receivedUser1 := &users.User{}
		err = json.NewDecoder(rr.Body).Decode(receivedUser1)
		if err != nil {
			t.Errorf("handler returned error: %v", err)
		}

		// construct a request and request body with a credential inside
		b1 := new(bytes.Buffer)
		// If it is bad JSON case
		if c.name == "Error case, bad JSON" {
			if err = json.NewEncoder(b1).Encode("{Something random here.}"); err != nil {
				t.Fatal(err)
			}
		} else {
			if err = json.NewEncoder(b1).Encode(c.credentials); err != nil {
				t.Fatal(err)
			}
		}

		// If it is connection to session db lost case
		if c.name == "Error case, connection to session db lost" {
			client.Close()
		}

		req1, err2 := http.NewRequest(c.requestMethod, "/v1/sessions", b1)
		if err2 != nil {
			t.Fatal(err2)
		}

		// add content type
		req1.Header.Add("Content-Type", c.contentType)

		if c.name == "Valid request 2" {
			req1.Header.Add("x-forwared-for", "192.168.0.3")
		}

		// We create a ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
		rr1 := httptest.NewRecorder()
		http.HandlerFunc(ctx.SessionsHandler).ServeHTTP(rr1, req1)

		// Our handlers satisfy http.Handler, so we can call their ServeHTTP method
		// directly and pass in our Request and ResponseRecorder.

		// Check the status code is what we expect.
		if status := rr1.Code; status != c.expectedStatusCode {
			t.Errorf("handler returned wrong status code: got %v want %v, case name: %s",
				status, c.expectedStatusCode, c.name)
		}

		if !c.expectedError {
			// checked if returned header has json as content type
			if respContentType := rr1.Header().Get("Content-Type"); respContentType != "application/json" {
				t.Errorf("handler returned wrong content type: got %v want %v, case name: %s",
					respContentType, "application/json", c.name)
			}

			// Check the response body is what we expect.
			receivedUser := &users.User{}
			err = json.NewDecoder(rr1.Body).Decode(receivedUser)
			if err != nil {
				t.Errorf("handler returned error: %v", err)
			}
		}
	}
}

// This tests the SpecificSessionHandler in auth.go
func TestSpecificSessionHandler(t *testing.T) {

	emailHash := md5.Sum([]byte(strings.ToLower("John.Smith@testing.com")))

	redisaddr := os.Getenv("REDISADDR")

	if len(redisaddr) == 0 {
		redisaddr = "localhost:6379"
	}

	client := redis.NewClient(&redis.Options{
		Addr: redisaddr,
	})

	defer client.Close()

	sessionsStore := sessions.NewRedisStore(client, time.Hour)

	dsn := fmt.Sprintf("root:%s@tcp(localhost:3306)/test", os.Getenv("MYSQL_ROOT_PASSWORD"))
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		t.Fatal(err)
	}

	defer db.Close()

	usersStore := users.NewMysqlStore(db)

	ctx := HandlerContext{"someRanDomKey3120", sessionsStore, usersStore}

	cases := []struct {
		name               string
		requestMethod      string
		resourcepath       string
		expectedError      bool
		expectedStatusCode int
	}{
		{
			"Valid Request",
			http.MethodDelete,
			"/v1/sessions/mine",
			false,
			http.StatusOK,
		},
		{
			"Wrong Request Method",
			http.MethodGet,
			"/v1/sessions/mine",
			true,
			http.StatusMethodNotAllowed,
		},
		{
			"Wrong resource path",
			http.MethodDelete,
			"/v1/sessions/yours",
			true,
			http.StatusForbidden,
		},
		{
			"Connection to Session DB lost",
			http.MethodDelete,
			"/v1/sessions/mine",
			true,
			http.StatusBadRequest,
		},
	}

	for _, c := range cases {

		_, err = db.Exec("TRUNCATE TABLE Users")
		if err != nil {
			t.Fatal(err)
		}

		sessionState := SessionState{
			time.Now(),
			&users.User{
				ID:        1,
				UserName:  "Adaquate",
				FirstName: "John",
				LastName:  "Smith",
				PhotoURL:  gravatarBasePhotoURL + fmt.Sprintf("%x", emailHash[:]),
			},
		}

		rr := httptest.NewRecorder()
		sid, err4 := sessions.BeginSession(ctx.SigningKey, sessionsStore, sessionState, rr)
		if err4 != nil {
			t.Fatal(err4)
		}
		authHeader := rr.Header().Get("Authorization")

		// Purposely disconnect Session DB to see if we can get an error
		if c.name == "Connection to Session DB lost" {
			client.Close()
		}

		//Start a new request for the SpecificSessionHandler
		req1, err2 := http.NewRequest(c.requestMethod, c.resourcepath, nil)
		if err2 != nil {
			t.Fatal(err2)
		}

		req1.Header.Add("Authorization", authHeader)

		rr1 := httptest.NewRecorder()

		http.HandlerFunc(ctx.SpecificSessionHandler).ServeHTTP(rr1, req1)

		if c.expectedError {
			if status := rr1.Code; status != c.expectedStatusCode {
				t.Errorf("handler returned wrong status code: got %v want %v, case name: %s",
					status, c.expectedStatusCode, c.name)
			}
			//check if sessiohn is not deleted
			err3 := ctx.SessionsStore.Get(sid, sessionState)
			if err3 == sessions.ErrStateNotFound && c.name != "Connection to Session DB lost" {
				t.Errorf("session was deleted by mistake: " + err3.Error() + c.name)
			}
		} else {
			// checked if the session is deleted
			err3 := ctx.SessionsStore.Get(sid, sessionState)
			if err3 != sessions.ErrStateNotFound {
				t.Errorf("session was not deleted " + "case: " + c.name)
			}
		}
	}
}

func TestUsersHandler(t *testing.T) {
	// Create a request to pass to our handler. We don't have any query parameters for now, so we'll
	// pass 'nil' as the third parameter.
	emailHash := md5.Sum([]byte(strings.ToLower("John.Smith@testing.com")))

	cases := []struct {
		name               string
		requestMethod      string
		contentType        string
		newUser            *users.NewUser
		expectedUser       *users.User
		expectedError      bool
		expectedStatusCode int
	}{
		{
			"Valid request",
			http.MethodPost,
			"application/json; charset=UTF-8",
			&users.NewUser{
				Email:        "John.Smith@testing.com",
				Password:     "moreThanAdaquate",
				PasswordConf: "moreThanAdaquate",
				UserName:     "Adaquate",
				FirstName:    "John",
				LastName:     "Smith",
			},
			&users.User{
				ID:        1,
				UserName:  "Adaquate",
				FirstName: "John",
				LastName:  "Smith",
				PhotoURL:  gravatarBasePhotoURL + fmt.Sprintf("%x", emailHash[:]),
			},
			false,
			http.StatusCreated,
		},
		{
			"Invalid request, duplicate username",
			http.MethodPost,
			"application/json; charset=UTF-8",
			&users.NewUser{
				Email:        "JohnSmith@testing.com",
				Password:     "moreThanAdaquate",
				PasswordConf: "moreThanAdaquate",
				UserName:     "Adaquate",
				FirstName:    "John",
				LastName:     "Smith",
			},
			&users.User{},
			true,
			http.StatusBadRequest,
		},
		{
			"Invalid request, duplicate email",
			http.MethodPost,
			"application/json; charset=UTF-8",
			&users.NewUser{
				Email:        "John.Smith@testing.com",
				Password:     "moreThanAdaquate",
				PasswordConf: "moreThanAdaquate",
				UserName:     "Adaquate2",
				FirstName:    "John",
				LastName:     "Smith",
			},
			&users.User{},
			true,
			http.StatusBadRequest,
		},
		{
			"Wrong Request Method, GET",
			http.MethodGet,
			"application/json",
			&users.NewUser{
				Email:        "John.Smith@testing.com",
				Password:     "moreThanAdaquate",
				PasswordConf: "moreThanAdaquate",
				UserName:     "Adaquate",
				FirstName:    "John",
				LastName:     "Smith",
			},
			&users.User{},
			true,
			http.StatusMethodNotAllowed,
		},
		{
			"Wrong Request Method, PATCH",
			http.MethodPatch,
			"application/json",
			&users.NewUser{
				Email:        "John.Smith@testing.com",
				Password:     "moreThanAdaquate",
				PasswordConf: "moreThanAdaquate",
				UserName:     "Adaquate",
				FirstName:    "John",
				LastName:     "Smith",
			},
			&users.User{},
			true,
			http.StatusMethodNotAllowed,
		},
		{
			"Wrong Request Method, DELETE",
			http.MethodDelete,
			"application/json",
			&users.NewUser{
				Email:        "John.Smith@testing.com",
				Password:     "moreThanAdaquate",
				PasswordConf: "moreThanAdaquate",
				UserName:     "Adaquate",
				FirstName:    "John",
				LastName:     "Smith",
			},
			&users.User{},
			true,
			http.StatusMethodNotAllowed,
		},
		{
			"Content Type Error, text/html",
			http.MethodPost,
			"text/html",
			&users.NewUser{
				Email:        "John.Smith@testing.com",
				Password:     "moreThanAdaquate",
				PasswordConf: "moreThanAdaquate",
				UserName:     "Adaquate",
				FirstName:    "John",
				LastName:     "Smith",
			},
			&users.User{},
			true,
			http.StatusUnsupportedMediaType,
		},
		{
			"Content Type Error, image/gif",
			http.MethodPost,
			"image/gif",
			&users.NewUser{
				Email:        "John.Smith@testing.com",
				Password:     "moreThanAdaquate",
				PasswordConf: "moreThanAdaquate",
				UserName:     "Adaquate",
				FirstName:    "John",
				LastName:     "Smith",
			},
			&users.User{},
			true,
			http.StatusUnsupportedMediaType,
		},
		{
			"Content Type Error, text/plain",
			http.MethodPost,
			"text/plain",
			&users.NewUser{
				Email:        "John.Smith@testing.com",
				Password:     "moreThanAdaquate",
				PasswordConf: "moreThanAdaquate",
				UserName:     "Adaquate",
				FirstName:    "John",
				LastName:     "Smith",
			},
			&users.User{},
			true,
			http.StatusUnsupportedMediaType,
		},
		{
			"Invalid New User, password too short",
			http.MethodPost,
			"application/json",
			&users.NewUser{
				Email:        "John.Smith@testing.com",
				Password:     "1234",
				PasswordConf: "1234",
				UserName:     "Adaquate",
				FirstName:    "John",
				LastName:     "Smith",
			},
			&users.User{},
			true,
			http.StatusBadRequest,
		},
		{
			"Invalid New User, invalid email",
			http.MethodPost,
			"application/json",
			&users.NewUser{
				Email:        "testtesting.com",
				Password:     "moreThanAdaquate",
				PasswordConf: "moreThanAdaquate",
				UserName:     "Adaquate",
				FirstName:    "John",
				LastName:     "Smith",
			},
			&users.User{},
			true,
			http.StatusBadRequest,
		},
		{
			"Invalid New User, userName contains spaces",
			http.MethodPost,
			"application/json",
			&users.NewUser{
				Email:        "John.Smith@testing.com",
				Password:     "moreThanAdaquate",
				PasswordConf: "moreThanAdaquate",
				UserName:     "Literal A Rebel",
				FirstName:    "John",
				LastName:     "Smith",
			},
			&users.User{},
			true,
			http.StatusBadRequest,
		},
		{
			"Invalid request, bad JSON",
			http.MethodPost,
			"application/json; charset=UTF-8",
			&users.NewUser{
				Email:        "John.Smith@testing.com",
				Password:     "moreThanAdaquate",
				PasswordConf: "moreThanAdaquate",
				UserName:     "Adaquate",
				FirstName:    "John",
				LastName:     "Smith",
			},
			&users.User{},
			true,
			http.StatusBadRequest,
		},
		{
			"Invalid request, server to user db connection lost",
			http.MethodPost,
			"application/json; charset=UTF-8",
			&users.NewUser{
				Email:        "John.Smith@testing.com",
				Password:     "moreThanAdaquate",
				PasswordConf: "moreThanAdaquate",
				UserName:     "Adaquate",
				FirstName:    "John",
				LastName:     "Smith",
			},
			&users.User{},
			true,
			http.StatusBadRequest,
		},
		{
			"Invalid request, server to session db connection lost",
			http.MethodPost,
			"application/json; charset=UTF-8",
			&users.NewUser{
				Email:        "John.Smith234@testing.com",
				Password:     "moreThanAdaquate",
				PasswordConf: "moreThanAdaquate",
				UserName:     "Adaquate234",
				FirstName:    "John",
				LastName:     "Smith",
			},
			&users.User{},
			true,
			http.StatusInternalServerError,
		},
	}

	for _, c := range cases {
		redisaddr := os.Getenv("REDISADDR")
		if len(redisaddr) == 0 {
			redisaddr = "127.0.0.1:6379"
		}

		client := redis.NewClient(&redis.Options{
			Addr: redisaddr,
		})
		defer client.Close()

		sessionsStore := sessions.NewRedisStore(client, time.Hour)

		dsn := fmt.Sprintf("root:%s@tcp(127.0.0.1:3306)/test", os.Getenv("MYSQL_ROOT_PASSWORD"))
		db, err := sql.Open("mysql", dsn)
		if err != nil {
			t.Fatal(err)
		}
		defer db.Close()

		usersStore := users.NewMysqlStore(db)

		b := new(bytes.Buffer)
		if c.name == "Invalid request, bad JSON" {
			if err := json.NewEncoder(b).Encode("Something random here."); err != nil {
				t.Fatal(err)
			}
		} else {
			if err := json.NewEncoder(b).Encode(c.newUser); err != nil {
				t.Fatal(err)
			}
		}

		req, err := http.NewRequest(c.requestMethod, "/v1/users", b)
		if err != nil {
			t.Fatal(err)
		}

		ctx := NewHandlerContext("someRanDomKey3120", sessionsStore, usersStore)
		// Simulate a lost of connection to mysql db
		if c.name == "Invalid request, server to user db connection lost" {
			db.Close()
		}
		// Simulate a lost of connection to redis db
		if c.name == "Invalid request, server to session db connection lost" {
			client.Close()
		}

		// add content type
		req.Header.Add("Content-Type", c.contentType)

		// We create a ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
		rr := httptest.NewRecorder()
		http.HandlerFunc(ctx.UsersHandler).ServeHTTP(rr, req)

		// Our handlers satisfy http.Handler, so we can call their ServeHTTP method
		// directly and pass in our Request and ResponseRecorder.

		// Check the status code is what we expect.
		if status := rr.Code; status != c.expectedStatusCode {
			t.Errorf("handler returned wrong status code: got %v want %v, case name: %s, error msg: %v",
				status, c.expectedStatusCode, c.name, rr.Body)
		}

		if !c.expectedError {
			// checked if returned header has json as content type
			if respContentType := rr.Header().Get("Content-Type"); respContentType != "application/json" {
				t.Errorf("handler returned wrong content type: got %v want %v, case name: %s",
					respContentType, "application/json", c.name)
			}

			// Check the response body is what we expect.
			receivedUser := &users.User{}
			err = json.NewDecoder(rr.Body).Decode(receivedUser)
			if err != nil {
				t.Errorf("handler returned error: %v", err)
			}
			if !reflect.DeepEqual(receivedUser, c.expectedUser) {
				t.Errorf("Error, invalid match in test [%s]", c.name)
			}
		}

	}

}

func TestSpecificUsersHandler(t *testing.T) {
	// Create a request to pass to our handler. We don't have any query parameters for now, so we'll
	// pass 'nil' as the third parameter.
	emailMap := make(map[int]string)
	emailMap[1] = "John.Smith@testing.com"
	emailMap[2] = "ThisIsANewUser@example.org"
	emailMap[3] = "Coolbeans@google.com"
	emailHash1 := md5.Sum([]byte(strings.ToLower("John.Smith@testing.com")))
	emailHash2 := md5.Sum([]byte(strings.ToLower("ThisIsANewUser@example.org")))
	emailHash3 := md5.Sum([]byte(strings.ToLower("Coolbeans@google.com")))
	redisaddr := os.Getenv("REDISADDR")
	if len(redisaddr) == 0 {
		redisaddr = "127.0.0.1:6379"
	}

	client := redis.NewClient(&redis.Options{
		Addr: redisaddr,
	})
	defer client.Close()

	sessionsStore := sessions.NewRedisStore(client, time.Hour)

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

	user1 := &users.NewUser{
		Email:        "John.Smith@testing.com",
		Password:     "moreThanAdaquate",
		PasswordConf: "moreThanAdaquate",
		UserName:     "Adaquate",
		FirstName:    "John",
		LastName:     "Smith",
	}

	user2 := &users.NewUser{
		Email:        "ThisIsANewUser@example.org",
		Password:     "SomethingSomethingForbidden",
		PasswordConf: "SomethingSomethingForbidden",
		UserName:     "Forbidden",
		FirstName:    "Dave",
		LastName:     "Jones",
	}

	user3 := &users.NewUser{
		Email:        "Coolbeans@google.com",
		Password:     "CantThinkOfSthClever",
		PasswordConf: "CantThinkOfSthClever",
		UserName:     "Coooooooool",
		FirstName:    "Something",
		LastName:     "Original",
	}

	ctx := NewHandlerContext("someRanDomKey3120", sessionsStore, usersStore)
	// user 1
	b := new(bytes.Buffer)
	if err = json.NewEncoder(b).Encode(user1); err != nil {
		t.Fatal(err)
	}
	req, err := http.NewRequest(http.MethodPost, "/v1/users", b)
	if err != nil {
		t.Fatal(err)
	}
	req.Header.Add("Content-Type", "application/json")
	rr := httptest.NewRecorder()
	http.HandlerFunc(ctx.UsersHandler).ServeHTTP(rr, req)
	receivedUser1 := &users.User{}
	err = json.NewDecoder(rr.Body).Decode(receivedUser1)
	if err != nil {
		t.Errorf("handler returned error: %v", err)
	}

	// user 2
	if err = json.NewEncoder(b).Encode(user2); err != nil {
		t.Fatal(err)
	}
	req, err = http.NewRequest(http.MethodPost, "/v1/users", b)
	if err != nil {
		t.Fatal(err)
	}
	req.Header.Add("Content-Type", "application/json")
	http.HandlerFunc(ctx.UsersHandler).ServeHTTP(rr, req)
	receivedUser2 := &users.User{}
	err = json.NewDecoder(rr.Body).Decode(receivedUser2)
	if err != nil {
		t.Errorf("handler returned error: %v", err)
	}

	// user 3
	if err = json.NewEncoder(b).Encode(user3); err != nil {
		t.Fatal(err)
	}
	req, err = http.NewRequest(http.MethodPost, "/v1/users", b)
	if err != nil {
		t.Fatal(err)
	}
	req.Header.Add("Content-Type", "application/json")
	http.HandlerFunc(ctx.UsersHandler).ServeHTTP(rr, req)
	receivedUser3 := &users.User{}
	err = json.NewDecoder(rr.Body).Decode(receivedUser3)
	if err != nil {
		t.Errorf("handler returned error: %v", err)
	}

	cases := []struct {
		name               string
		requestPath        string
		requestMethod      string
		contentType        string
		logInAs            int
		expectedUser       *users.User
		newUpdate          *users.Updates
		expectedError      bool
		expectedStatusCode int
	}{
		{
			"Valid request, GET with me",
			"me",
			http.MethodGet,
			"text/plain",
			1,
			&users.User{
				ID:        1,
				UserName:  "Adaquate",
				FirstName: "John",
				LastName:  "Smith",
				PhotoURL:  gravatarBasePhotoURL + fmt.Sprintf("%x", emailHash1[:]),
			},
			&users.Updates{},
			false,
			http.StatusOK,
		},
		{
			"Valid request, GET with ID",
			"2",
			http.MethodGet,
			"text/html; charset=UTF-8",
			2,
			&users.User{
				ID:        2,
				UserName:  "Forbidden",
				FirstName: "Dave",
				LastName:  "Jones",
				PhotoURL:  gravatarBasePhotoURL + fmt.Sprintf("%x", emailHash2[:]),
			},
			&users.Updates{},
			false,
			http.StatusOK,
		},
		{
			"Invalid request, bad URL path",
			"em",
			http.MethodGet,
			"text/html; charset=UTF-8",
			2,
			&users.User{
				ID:        2,
				UserName:  "Forbidden",
				FirstName: "Dave",
				LastName:  "Jones",
				PhotoURL:  gravatarBasePhotoURL + fmt.Sprintf("%x", emailHash2[:]),
			},
			&users.Updates{},
			true,
			http.StatusBadRequest,
		},
		{
			"Valid request, PATCH",
			"me",
			http.MethodPatch,
			"application/json",
			1,
			&users.User{
				ID:        1,
				UserName:  "Adaquate",
				FirstName: "Johnny",
				LastName:  "Depp",
				PhotoURL:  gravatarBasePhotoURL + fmt.Sprintf("%x", emailHash1[:]),
			},
			&users.Updates{
				FirstName: "Johnny",
				LastName:  "Depp",
			},
			false,
			http.StatusOK,
		},
		{
			"Valid request, PATCH",
			"3",
			http.MethodPatch,
			"application/json",
			3,
			&users.User{
				ID:        3,
				UserName:  "Coooooooool",
				FirstName: "Yi",
				LastName:  "Ha",
				PhotoURL:  gravatarBasePhotoURL + fmt.Sprintf("%x", emailHash3[:]),
			},
			&users.Updates{
				FirstName: "Yi",
				LastName:  "Ha",
			},
			false,
			http.StatusOK,
		},
		{
			"Invalid request, no such userID for GET",
			"4040404",
			http.MethodGet,
			"application/json",
			1,
			&users.User{},
			&users.Updates{
				FirstName: "Johnny",
				LastName:  "Depp",
			},
			true,
			http.StatusNotFound,
		},
		{
			"Invalid request, unauthorized GET",
			"me",
			http.MethodGet,
			"text/html",
			1,
			&users.User{},
			&users.Updates{
				FirstName: "Johnny",
				LastName:  "Depp",
			},
			true,
			http.StatusUnauthorized,
		},
		{
			"Invalid request, unauthorized PATCH",
			"me",
			http.MethodPatch,
			"application/json",
			1,
			&users.User{},
			&users.Updates{
				FirstName: "Johnny",
				LastName:  "Depp",
			},
			true,
			http.StatusUnauthorized,
		},
		{
			"Invalid request, forbidden access PATCH",
			"2",
			http.MethodPatch,
			"application/json",
			1,
			&users.User{},
			&users.Updates{
				FirstName: "Johnny",
				LastName:  "Depp",
			},
			true,
			http.StatusForbidden,
		},
		{
			"Invalid request, incorrect content type PATCH",
			"1",
			http.MethodPatch,
			"application/xml",
			1,
			&users.User{},
			&users.Updates{
				FirstName: "Johnny",
				LastName:  "Depp",
			},
			true,
			http.StatusUnsupportedMediaType,
		},
		{
			"Invalid request, method is not GET or PATCH",
			"1",
			http.MethodPost,
			"application/json",
			1,
			&users.User{},
			&users.Updates{
				FirstName: "Johnny",
				LastName:  "Depp",
			},
			true,
			http.StatusMethodNotAllowed,
		},
		{
			"Invalid request, bad JSON",
			"me",
			http.MethodPatch,
			"application/json",
			1,
			&users.User{
				ID:        1,
				UserName:  "Adaquate",
				FirstName: "Johnny",
				LastName:  "Depp",
				PhotoURL:  gravatarBasePhotoURL + fmt.Sprintf("%x", emailHash1[:]),
			},
			&users.Updates{
				FirstName: "Johnny",
				LastName:  "Depp",
			},
			true,
			http.StatusBadRequest,
		},
		{
			"Invalid update, nil update",
			"me",
			http.MethodPatch,
			"application/json",
			1,
			&users.User{},
			nil,
			true,
			http.StatusBadRequest,
		},
	}

	for _, c := range cases {
		rr := httptest.NewRecorder()

		authHeader := ""
		// create authenticated condition for users (for http.StatusUnauthorized 401 check)
		// authenticate the user indicated by c.logInAs
		if c.expectedStatusCode != http.StatusUnauthorized {

			newSession := &SessionState{}
			if c.logInAs == 1 {
				newSession = &SessionState{time.Now(), receivedUser1}
			} else if c.logInAs == 2 {
				newSession = &SessionState{time.Now(), receivedUser2}
			} else {
				newSession = &SessionState{time.Now(), receivedUser3}
			}

			_, err := sessions.BeginSession(ctx.SigningKey, ctx.SessionsStore, newSession, rr)
			if err != nil {
				t.Fatal(err)
			}
			authHeader = rr.Header().Get("Authorization")

		}

		rr = httptest.NewRecorder()

		// make some requests here
		if c.requestMethod == http.MethodPatch {
			b := new(bytes.Buffer)

			if c.name == "Invalid request, bad JSON" {
				if err := json.NewEncoder(b).Encode("Something random here."); err != nil {
					t.Fatal(err)
				}
			} else {
				if err := json.NewEncoder(b).Encode(c.newUpdate); err != nil {
					t.Fatal(err)
				}
			}

			req, err := http.NewRequest(c.requestMethod, "/v1/users/"+c.requestPath, b)
			if err != nil {
				t.Fatal(err)
			}

			req.Header.Add("Content-Type", c.contentType)
			req.Header.Add("Authorization", authHeader)

			http.HandlerFunc(ctx.SpecificUsersHandler).ServeHTTP(rr, req)

			// Check the status code is what we expect.
			if status := rr.Code; status != c.expectedStatusCode {
				t.Errorf("handler returned wrong status code: got %v want %v, case name: %s",
					status, c.expectedStatusCode, c.name)
			}

			if !c.expectedError {
				// Check the response body is what we expect.
				receivedUser := &users.User{}
				err = json.NewDecoder(rr.Body).Decode(receivedUser)
				if err != nil {
					t.Errorf("handler returned error: %v", err)
				}
				if !reflect.DeepEqual(receivedUser, c.expectedUser) {
					t.Errorf("Error, invalid match in test [%s]", c.name)
				}
			}
		} else {
			req, err = http.NewRequest(c.requestMethod, "/v1/users/"+c.requestPath, nil)
			if err != nil {
				t.Fatal(err)
			}
			req.Header.Add("Content-Type", c.contentType)
			req.Header.Add("Authorization", authHeader)
			http.HandlerFunc(ctx.SpecificUsersHandler).ServeHTTP(rr, req)

			// Check the status code is what we expect.
			if status := rr.Code; status != c.expectedStatusCode {
				t.Errorf("handler returned wrong status code: got %v want %v, case name: %s",
					status, c.expectedStatusCode, c.name)
			}

			if !c.expectedError {
				// Check the response body is what we expect.
				receivedUser := &users.User{}
				err = json.NewDecoder(rr.Body).Decode(receivedUser)
				if err != nil {
					t.Errorf("handler returned error: %v", err)
				}
				if !reflect.DeepEqual(receivedUser, c.expectedUser) {
					t.Errorf("Error, invalid match in test [%s]", c.name)
				}
			}
		}

	}

}
