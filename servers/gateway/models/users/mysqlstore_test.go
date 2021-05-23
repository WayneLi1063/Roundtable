package users

import (
	"fmt"
	"reflect"
	"regexp"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
)

// TestGetByID is a test function for the Mysqlstore's GetByID
func TestGetByID(t *testing.T) {
	// Create a slice of test cases
	cases := []struct {
		name         string
		expectedUser *User
		idToGet      int64
		expectError  bool
	}{
		{
			"User Found",
			&User{
				1,
				"test@test.com",
				[]byte("passhash123"),
				"username",
				"firstname",
				"lastname",
				"photourl",
			},
			1,
			false,
		},
		{
			"User Not Found",
			&User{},
			2,
			true,
		},
		{
			"User With Large ID Found",
			&User{
				1234567890,
				"test@test.com",
				[]byte("passhash123"),
				"username",
				"firstname",
				"lastname",
				"photourl",
			},
			1234567890,
			false,
		},
	}

	for _, c := range cases {
		// Create a new mock database for each case
		db, mock, err := sqlmock.New()
		if err != nil {
			t.Fatalf("There was a problem opening a database connection: [%v]", err)
		}
		defer db.Close()

		mainSQLStore := NewMysqlStore(db)

		// Create an expected row to the mock DB
		row := mock.NewRows([]string{
			"ID",
			"Email",
			"PassHash",
			"UserName",
			"FirstName",
			"LastName",
			"PhotoURL"},
		).AddRow(
			c.expectedUser.ID,
			c.expectedUser.Email,
			c.expectedUser.PassHash,
			c.expectedUser.UserName,
			c.expectedUser.FirstName,
			c.expectedUser.LastName,
			c.expectedUser.PhotoURL,
		)

		query := regexp.QuoteMeta("SELECT id, email, pass_hash, usr_name, first_name, last_name, photo_url FROM Users WHERE id=?")

		if c.expectError {
			// Set up expected query that will expect an error
			mock.ExpectQuery(query).WithArgs(c.idToGet).WillReturnError(ErrUserNotFound)

			// Test GetByID()
			user, err := mainSQLStore.GetByID(c.idToGet)
			if user != nil || err == nil {
				t.Errorf("Expected error [%v] but got [%v] instead", ErrUserNotFound, err)
			}
		} else {
			// Set up an expected query with the expected row from the mock DB
			mock.ExpectQuery(query).WithArgs(c.idToGet).WillReturnRows(row)

			// Test GetByID()
			user, err := mainSQLStore.GetByID(c.idToGet)
			if err != nil {
				t.Errorf("Unexpected error on successful test [%s]: %v", c.name, err)
			}
			if !reflect.DeepEqual(user, c.expectedUser) {
				t.Errorf("Error, invalid match in test [%s]", c.name)
			}
		}

		if err := mock.ExpectationsWereMet(); err != nil {
			t.Errorf("There were unfulfilled expectations: %s", err)
		}

	}
}

// TestGetByEmail is a test function for the Mysqlstore's GetByEmail
func TestGetByEmail(t *testing.T) {
	// Create a slice of test cases
	cases := []struct {
		name         string
		expectedUser *User
		emailToGet   string
		expectError  bool
	}{
		{
			"User Found",
			&User{
				1,
				"test@test.com",
				[]byte("passhash123"),
				"username",
				"firstname",
				"lastname",
				"photourl",
			},
			"test@test.com",
			false,
		},
		{
			"Invalid Email without at symbol",
			&User{
				22,
				"testtesting.com",
				[]byte("passhash123"),
				"username",
				"firstname",
				"lastname",
				"photourl",
			},
			"testtesting.com",
			true,
		},
		{
			"Invalid Email with multiple at symbol",
			&User{
				23,
				"A@b@c@example.com",
				[]byte("passhash123"),
				"username",
				"firstname",
				"lastname",
				"photourl",
			},
			"A@b@c@example.com",
			true,
		},
		{
			"User Not Found",
			&User{},
			"test@test.com",
			true,
		},
		{
			"User with long but valid email Found",
			&User{
				1234567890,
				"disposable.style.email.with+symbol@example.com",
				[]byte("passhash123"),
				"username",
				"firstname",
				"lastname",
				"photourl",
			},
			"disposable.style.email.with+symbol@example.com",
			false,
		},
		{
			"Check if SQL injection attack is prevented",
			&User{
				1234567890,
				"test@test.com",
				[]byte("passhash123"),
				"username",
				"firstname",
				"lastname",
				"photourl",
			},
			"; drop table users; select ",
			true,
		},
		{
			"Emails with strange character and TLD",
			&User{
				1234567890,
				"' '@s.example",
				[]byte("passhash123"),
				"username",
				"firstname",
				"lastname",
				"photourl",
			},
			"' '@s.example",
			false,
		},
	}

	for _, c := range cases {
		// Create a new mock database for each case
		db, mock, err := sqlmock.New()
		if err != nil {
			t.Fatalf("There was a problem opening a database connection: [%v]", err)
		}
		defer db.Close()

		mainSQLStore := NewMysqlStore(db)

		// Create an expected row to the mock DB
		row := mock.NewRows([]string{
			"ID",
			"Email",
			"PassHash",
			"UserName",
			"FirstName",
			"LastName",
			"PhotoURL"},
		).AddRow(
			c.expectedUser.ID,
			c.expectedUser.Email,
			c.expectedUser.PassHash,
			c.expectedUser.UserName,
			c.expectedUser.FirstName,
			c.expectedUser.LastName,
			c.expectedUser.PhotoURL,
		)

		query := regexp.QuoteMeta("SELECT id, email, pass_hash, usr_name, first_name, last_name, photo_url FROM Users WHERE email=?")

		if c.expectError {
			// Set up expected query that will expect an error
			mock.ExpectQuery(query).WithArgs(c.emailToGet).WillReturnError(ErrUserNotFound)

			// Test GetByEmail()
			user, err := mainSQLStore.GetByEmail(c.emailToGet)
			if user != nil || err == nil {
				t.Errorf("Expected error [%v] but got [%v] instead", ErrUserNotFound, err)
			}
		} else {
			// Set up an expected query with the expected row from the mock DB
			mock.ExpectQuery(query).WithArgs(c.emailToGet).WillReturnRows(row)

			// Test GetByEmail()
			user, err := mainSQLStore.GetByEmail(c.emailToGet)
			if err != nil {
				t.Errorf("Unexpected error on successful test [%s]: %v", c.name, err)
			}
			if !reflect.DeepEqual(user, c.expectedUser) {
				t.Errorf("Error, invalid match in test [%s]", c.name)
			}
		}

		if err := mock.ExpectationsWereMet(); err != nil {
			t.Errorf("There were unfulfilled expectations: %s", err)
		}

	}
}

// TestGetByUserName is a test function for the Mysqlstore's GetByUserName
func TestGetByUserName(t *testing.T) {
	// Create a slice of test cases
	cases := []struct {
		name          string
		expectedUser  *User
		userNameToGet string
		expectError   bool
	}{
		{
			"User Found",
			&User{
				1,
				"test@test.com",
				[]byte("passhash123"),
				"username",
				"firstname",
				"lastname",
				"photourl",
			},
			"username",
			false,
		},
		{
			"User not found, empty userName",
			&User{
				1,
				"test@test.com",
				[]byte("passhash123"),
				"username",
				"firstname",
				"lastname",
				"photourl",
			},
			"",
			true,
		},
		{
			"User not found, userName invalid, contain spaces",
			&User{
				1,
				"test@test.com",
				[]byte("passhash123"),
				"username",
				"firstname",
				"lastname",
				"photourl",
			},
			"user name",
			true,
		},
		{
			"User not found, userName invalid, contain multiple spaces",
			&User{
				1,
				"test@test.com",
				[]byte("passhash123"),
				"username",
				"firstname",
				"lastname",
				"photourl",
			},
			"   ",
			true,
		},
		{
			"User Not Found",
			&User{},
			"username",
			true,
		},
		{
			"User with long but valid email Found",
			&User{
				1234567890,
				"disposable.style.email.with+symbol@example.com",
				[]byte("passhash123"),
				"ThisIsToTestTheNumberOfCharactersThatTheSQLSchemaCanSupportICanKeepThisGoingForeverWhyNotTrySomeSpecialCharacters?!#%$.,p''",
				"firstname",
				"lastname",
				"photourl",
			},
			"ThisIsToTestTheNumberOfCharactersThatTheSQLSchemaCanSupportICanKeepThisGoingForeverWhyNotTrySomeSpecialCharacters?!#%$.,p''",
			false,
		},
		{
			"Check if SQL injection attack is prevented",
			&User{
				1234567890,
				"test@test.com",
				[]byte("passhash123"),
				"username",
				"firstname",
				"lastname",
				"photourl",
			},
			"; drop table users; select ",
			true,
		},
	}

	for _, c := range cases {
		// Create a new mock database for each case
		db, mock, err := sqlmock.New()
		if err != nil {
			t.Fatalf("There was a problem opening a database connection: [%v]", err)
		}
		defer db.Close()

		mainSQLStore := NewMysqlStore(db)

		// Create an expected row to the mock DB
		row := mock.NewRows([]string{
			"ID",
			"Email",
			"PassHash",
			"UserName",
			"FirstName",
			"LastName",
			"PhotoURL"},
		).AddRow(
			c.expectedUser.ID,
			c.expectedUser.Email,
			c.expectedUser.PassHash,
			c.expectedUser.UserName,
			c.expectedUser.FirstName,
			c.expectedUser.LastName,
			c.expectedUser.PhotoURL,
		)

		query := regexp.QuoteMeta("SELECT id, email, pass_hash, usr_name, first_name, last_name, photo_url FROM Users WHERE usr_name=?")

		if c.expectError {
			// Set up expected query that will expect an error
			mock.ExpectQuery(query).WithArgs(c.userNameToGet).WillReturnError(ErrUserNotFound)

			// Test GetByUserName()
			user, err := mainSQLStore.GetByUserName(c.userNameToGet)
			if user != nil || err == nil {
				t.Errorf("Expected error [%v] but got [%v] instead", ErrUserNotFound, err)
			}
		} else {
			// Set up an expected query with the expected row from the mock DB
			mock.ExpectQuery(query).WithArgs(c.userNameToGet).WillReturnRows(row)

			// Test GetByUserName()
			user, err := mainSQLStore.GetByUserName(c.userNameToGet)
			if err != nil {
				t.Errorf("Unexpected error on successful test [%s]: %v", c.name, err)
			}
			if !reflect.DeepEqual(user, c.expectedUser) {
				t.Errorf("Error, invalid match in test [%s]", c.name)
			}
		}

		if err := mock.ExpectationsWereMet(); err != nil {
			t.Errorf("There were unfulfilled expectations: %s", err)
		}

	}
}

// TestInsert is a test function for the Mysqlstore's Insert
func TestInsert(t *testing.T) {
	// Create a slice of test cases
	cases := []struct {
		name         string
		expectedUser *User
		expectedID   int64
		expectError  bool
	}{
		{
			"A valid user",
			&User{
				123,
				"test@test.com",
				[]byte("passhash123"),
				"username",
				"firstname",
				"lastname",
				"photourl",
			},
			1,
			false,
		},
		{
			"Another valid user",
			&User{
				1,
				"John.Smith@testing.com",
				[]byte("moreThanAdaquate"),
				"Adaquate",
				"John",
				"Smith",
				"https://www.gravatar.com/avatar/cb5b989399d41e648ce246caa906b458",
			},
			2,
			false,
		},
		{
			"User not found, empty userName",
			&User{
				1,
				"test@test.com",
				[]byte("passhash123"),
				"",
				"firstname",
				"lastname",
				"photourl",
			},
			-1,
			true,
		},
		{
			"User not found, userName invalid, contain spaces",
			&User{
				1,
				"test@test.com",
				[]byte("passhash123"),
				"user name",
				"firstname",
				"lastname",
				"photourl",
			},
			-1,
			true,
		},
		{
			"User not found, userName invalid, contain multiple spaces",
			&User{
				1,
				"test@test.com",
				[]byte("passhash123"),
				"      ",
				"firstname",
				"lastname",
				"photourl",
			},
			-1,
			true,
		},
		{
			"User Not Found",
			&User{},
			-1,
			true,
		},
		{
			"User with long but valid email and username",
			&User{
				1234567890,
				"disposable.style.email.with+symbol@example.com",
				[]byte("passhash123"),
				"ThisIsToTestTheNumberOfCharactersThatTheSQLSchemaCanSupportICanKeepThisGoingForeverWhyNotTrySomeSpecialCharacters?!#%$.,p''",
				"firstname",
				"lastname",
				"photourl",
			},
			3,
			false,
		},
		{
			"Check if SQL injection attack is prevented",
			&User{
				1234567890,
				"test@test.com",
				[]byte("passhash123"),
				"; drop table users; select ",
				"firstname",
				"lastname",
				"photourl",
			},
			-1,
			true,
		},
		{
			"Invalid Email without at symbol",
			&User{
				22,
				"testtesting.com",
				[]byte("passhash123"),
				"username",
				"firstname",
				"lastname",
				"photourl",
			},
			-1,
			true,
		},
		{
			"Invalid Email with multiple at symbol",
			&User{
				23,
				"A@b@c@example.com",
				[]byte("passhash123"),
				"username",
				"firstname",
				"lastname",
				"photourl",
			},
			-1,
			true,
		},
		{
			"valid Email with strange symbols",
			&User{
				23,
				"' '@s.example",
				[]byte("passhash123"),
				"username",
				"firstname",
				"lastname",
				"photourl",
			},
			4,
			false,
		},
	}

	for _, c := range cases {
		// Create a new mock database for each case
		db, mock, err := sqlmock.New()
		if err != nil {
			t.Fatalf("There was a problem opening a database connection: [%v]", err)
		}
		defer db.Close()

		mainSQLStore := NewMysqlStore(db)

		query := regexp.QuoteMeta("INSERT INTO Users(email, pass_hash, usr_name, first_name, last_name, photo_url) VALUES (?,?,?,?,?,?)")

		if c.expectError {
			// Set up expected query that will expect an error
			mock.ExpectExec(query).WithArgs(
				c.expectedUser.Email,
				c.expectedUser.PassHash,
				c.expectedUser.UserName,
				c.expectedUser.FirstName,
				c.expectedUser.LastName,
				c.expectedUser.PhotoURL).WillReturnError(fmt.Errorf("Some database error"))

			// Test Inserting()
			user, err := mainSQLStore.Insert(c.expectedUser)
			if user != nil || err == nil {
				t.Errorf("Expected an error here, test case is: %s", c.name)
			}
		} else {
			// Set up an expected query with the expected row from the mock DB
			mock.ExpectExec(query).WithArgs(
				c.expectedUser.Email,
				c.expectedUser.PassHash,
				c.expectedUser.UserName,
				c.expectedUser.FirstName,
				c.expectedUser.LastName,
				c.expectedUser.PhotoURL).WillReturnResult(sqlmock.NewResult(c.expectedID, 1))

			// Test Inserting()
			user, err := mainSQLStore.Insert(c.expectedUser)
			if err != nil {
				t.Errorf("Unexpected error on successful test [%s]: %v", c.name, err)
			}
			if !reflect.DeepEqual(user, c.expectedUser) {
				t.Errorf("Error, invalid match in test [%s]", c.name)
			}
		}

		if err := mock.ExpectationsWereMet(); err != nil {
			t.Errorf("There were unfulfilled expectations: %s", err)
		}

	}
}

// TestUpdate is a test function for the Mysqlstore's Update
func TestUpdate(t *testing.T) {
	// Create a slice of test cases
	cases := []struct {
		name         string
		expectedUser *User
		update       *Updates
	}{
		{
			"Update both names",
			&User{
				1,
				"John.Smith@testing.com",
				[]byte("moreThanAdaquate"),
				"Adaquate",
				"Johnny",
				"Depp",
				"https://www.gravatar.com/avatar/cb5b989399d41e648ce246caa906b458",
			},
			&Updates{
				FirstName: "Johnny",
				LastName:  "Depp",
			},
		},
		{
			"Empty update",
			&User{
				1,
				"John.Smith@testing.com",
				[]byte("moreThanAdaquate"),
				"Adaquate",
				"",
				"",
				"https://www.gravatar.com/avatar/cb5b989399d41e648ce246caa906b458",
			},
			&Updates{
				FirstName: "",
				LastName:  "",
			},
		},
		{
			"Make first name empty",
			&User{
				1,
				"John.Smith@testing.com",
				[]byte("moreThanAdaquate"),
				"Adaquate",
				"",
				"Smith",
				"https://www.gravatar.com/avatar/cb5b989399d41e648ce246caa906b458",
			},
			&Updates{
				FirstName: "",
				LastName:  "Smith",
			},
		},
		{
			"Make last name empty",
			&User{
				1,
				"John.Smith@testing.com",
				[]byte("moreThanAdaquate"),
				"Adaquate",
				"John",
				"",
				"https://www.gravatar.com/avatar/cb5b989399d41e648ce246caa906b458",
			},
			&Updates{
				FirstName: "John",
				LastName:  "",
			},
		},
		{
			"Empty struct",
			&User{
				1,
				"John.Smith@testing.com",
				[]byte("moreThanAdaquate"),
				"Adaquate",
				"",
				"",
				"https://www.gravatar.com/avatar/cb5b989399d41e648ce246caa906b458",
			},
			&Updates{},
		},
		{
			"Update first name only",
			&User{
				1,
				"John.Smith@testing.com",
				[]byte("moreThanAdaquate"),
				"Adaquate",
				"Johnny",
				"",
				"https://www.gravatar.com/avatar/cb5b989399d41e648ce246caa906b458",
			},
			&Updates{
				FirstName: "Johnny",
			},
		},
		{
			"Update first name only",
			&User{
				1,
				"John.Smith@testing.com",
				[]byte("moreThanAdaquate"),
				"Adaquate",
				"",
				"Depp",
				"https://www.gravatar.com/avatar/cb5b989399d41e648ce246caa906b458",
			},
			&Updates{
				LastName: "Depp",
			},
		},
		{
			"Invalid update",
			&User{
				1,
				"John.Smith@testing.com",
				[]byte("moreThanAdaquate"),
				"Adaquate",
				"John",
				"Smith",
				"https://www.gravatar.com/avatar/cb5b989399d41e648ce246caa906b458",
			},
			&Updates{
				FirstName: "John",
				LastName:  "Smith",
			},
		},
		{
			"Wrong Client Update ID",
			&User{
				1,
				"John.Smith@testing.com",
				[]byte("moreThanAdaquate"),
				"Adaquate",
				"Johnny",
				"Depp",
				"https://www.gravatar.com/avatar/cb5b989399d41e648ce246caa906b458",
			},
			&Updates{
				FirstName: "Johnny",
				LastName:  "Depp",
			},
		},
		{
			"Update is nil",
			&User{
				1,
				"John.Smith@testing.com",
				[]byte("moreThanAdaquate"),
				"Adaquate",
				"Johnny",
				"Depp",
				"https://www.gravatar.com/avatar/cb5b989399d41e648ce246caa906b458",
			},
			nil,
		},
	}

	for _, c := range cases {
		// Create a new mock database for each case
		db, mock, err := sqlmock.New()
		if err != nil {
			t.Fatalf("There was a problem opening a database connection: [%v]", err)
		}
		defer db.Close()

		mainSQLStore := NewMysqlStore(db)

		// Create an expected row to the mock DB
		row := mock.NewRows([]string{
			"ID",
			"Email",
			"PassHash",
			"UserName",
			"FirstName",
			"LastName",
			"PhotoURL"},
		).AddRow(
			1,
			"John.Smith@testing.com",
			[]byte("moreThanAdaquate"),
			"Adaquate",
			"John",
			"Smith",
			"https://www.gravatar.com/avatar/cb5b989399d41e648ce246caa906b458",
		)

		selectQuery := regexp.QuoteMeta("SELECT id, email, pass_hash, usr_name, first_name, last_name, photo_url FROM Users WHERE id=?")
		updateQuery := regexp.QuoteMeta("UPDATE Users SET first_name = ?, last_name = ? WHERE id = ?")

		// Set up an expected query with the expected row from the mock DB
		if c.name != "Update is nil" {
			mock.ExpectQuery(selectQuery).
				WithArgs(1).WillReturnRows(row)
			mock.ExpectExec(updateQuery).
				WithArgs(c.update.FirstName, c.update.LastName, 1).
				WillReturnResult(sqlmock.NewResult(1, 1))
		}

		// Test Update()
		if c.name == "Wrong Client Update ID" {
			_, err2 := mainSQLStore.Update(2, c.update)
			if err2 == nil {
				t.Errorf("Expected an error here.")
			}
		}
		user, err2 := mainSQLStore.Update(1, c.update)

		if c.name == "Update is nil" && err2 == nil {
			t.Errorf("Expected an error here.")
		} else if err2 != nil && c.name != "Update is nil" {
			t.Errorf("Unexpected error on successful test [%s]: %v", c.name, err)
		}
		if err2 == nil && !reflect.DeepEqual(user, c.expectedUser) {
			t.Errorf("Error, invalid match in test [%s]", c.name)
		}

		if err := mock.ExpectationsWereMet(); err2 == nil && err != nil {
			t.Errorf("There were unfulfilled expectations: %s", err)
		}

	}
}

// TestDelete is a test function for the Mysqlstore's Delete
func TestDelete(t *testing.T) {
	cases := []struct {
		name                string
		idToDelete          int64
		expectDeletionError bool
	}{
		{
			"0",
			0,
			true,
		},
		{
			"Negative number",
			-1,
			true,
		},
		{
			"Super large number",
			92493849820948902,
			true,
		},
		{
			"1",
			1,
			false,
		},
		{
			"4",
			1,
			false,
		},
		{
			"3",
			1,
			false,
		},
	}

	for _, c := range cases {

		// Create a new mock database for each case
		db, mock, err := sqlmock.New()
		if err != nil {
			t.Errorf("There was a problem opening a database connection: [%v]", err)
		}
		defer db.Close()

		mainSQLStore := NewMysqlStore(db)

		mock.NewRows([]string{
			"ID",
			"Email",
			"PassHash",
			"UserName",
			"FirstName",
			"LastName",
			"PhotoURL"},
		).AddRow(
			1,
			"John.Smith@testing.com",
			[]byte("moreThanAdaquate"),
			"Adaquate",
			"John",
			"Smith",
			"https://www.gravatar.com/avatar/cb5b989399d41e648ce246caa906b458",
		).AddRow(
			2,
			"' '@s.example",
			[]byte("SomeExamplePassword123"),
			"username",
			"",
			"",
			"FakeURL",
		).AddRow(
			3,
			"disposable.style.email.with+symbol@example.com",
			[]byte("passhash123"),
			"ThisIsToTestTheNumberOfCharactersThatTheSQLSchemaCanSupportICanKeepThisGoingForeverWhyNotTrySomeSpecialCharacters?!#%$.,p''",
			"firstname",
			"lastname",
			"photourl",
		).AddRow(
			4,
			"welldone+@adomain",
			[]byte("                    "),
			"TechnicallyPossible",
			"Have A",
			"Nice Day",
			"https://www.gravatar.com/avatar/cb5b801239d41e648ce246ca1206b458",
		)

		deleteQuery := regexp.QuoteMeta("DELETE FROM Users WHERE id=?")
		selectQuery := regexp.QuoteMeta("SELECT id, email, pass_hash, usr_name, first_name, last_name, photo_url FROM Users WHERE id=?")

		// Set up expected query that will expect an error
		if c.expectDeletionError {
			mock.
				ExpectExec(deleteQuery).WithArgs(c.idToDelete).
				WillReturnError(fmt.Errorf("Some database error"))

			err = mainSQLStore.Delete(c.idToDelete)
			if err == nil {
				t.Errorf("Expected error on invalid delete, id is: %d", c.idToDelete)
			}
		} else {
			mock.ExpectExec(deleteQuery).WithArgs(c.idToDelete).WillReturnResult(sqlmock.NewResult(4, 1))
			err = mainSQLStore.Delete(c.idToDelete)
			if err != nil {
				t.Errorf("Unexpected error on successful delete: %v", err)
			}

			mock.ExpectQuery(selectQuery).
				WithArgs(c.idToDelete).WillReturnError(ErrUserNotFound)
			_, err = mainSQLStore.GetByID(c.idToDelete)
			if err == nil {
				t.Errorf("Expected a UserNotFoundError, but got no error instead.")
			}
		}

		if err := mock.ExpectationsWereMet(); err != nil {
			t.Errorf("There were unfulfilled expectations: %s", err)
		}
	}
}
