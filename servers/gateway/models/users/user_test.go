package users

import (
	"crypto/md5"
	"fmt"
	"strings"
	"testing"

	"golang.org/x/crypto/bcrypt"
)

// TestValidate is a test function for the user's Validate
func TestValidate(t *testing.T) {
	cases := []struct {
		name        string
		newUser     *NewUser
		expectError bool
	}{
		{
			"Valid User 1",
			&NewUser{
				Email:        "John.Smith@testing.com",
				Password:     "moreThanAdaquate",
				PasswordConf: "moreThanAdaquate",
				UserName:     "Adaquate",
				FirstName:    "John",
				LastName:     "Smith",
			},
			false,
		},
		{
			"Invalid Email without at symbol",
			&NewUser{
				Email:        "testtesting.com",
				Password:     "moreThanAdaquate",
				PasswordConf: "moreThanAdaquate",
				UserName:     "Adaquate",
				FirstName:    "John",
				LastName:     "Smith",
			},
			true,
		},
		{
			"Invalid Email with multiple at symbol",
			&NewUser{
				Email:        "A@b@c@example.com",
				Password:     "moreThanAdaquate",
				PasswordConf: "moreThanAdaquate",
				UserName:     "Adaquate",
				FirstName:    "John",
				LastName:     "Smith",
			},
			true,
		},
		{
			"Invalid password, too few characters",
			&NewUser{
				Email:        "John.Smith@testing.com",
				Password:     "12345",
				PasswordConf: "12345",
				UserName:     "Adaquate",
				FirstName:    "John",
				LastName:     "Smith",
			},
			true,
		},
		{
			"Invalid password, empty field",
			&NewUser{
				Email:        "John.Smith@testing.com",
				Password:     "",
				PasswordConf: "",
				UserName:     "Adaquate",
				FirstName:    "John",
				LastName:     "Smith",
			},
			true,
		},
		{
			"Invalid password, did not match confirmation",
			&NewUser{
				Email:        "John.Smith@testing.com",
				Password:     "moreThanAdaquate",
				PasswordConf: "moreThanAdaquate1",
				UserName:     "Adaquate",
				FirstName:    "John",
				LastName:     "Smith",
			},
			true,
		},
		{
			"Invalid username, username is empty",
			&NewUser{
				Email:        "John.Smith@testing.com",
				Password:     "moreThanAdaquate",
				PasswordConf: "moreThanAdaquate",
				UserName:     "",
				FirstName:    "John",
				LastName:     "Smith",
			},
			true,
		},
		{
			"Invalid username, userName contain spaces",
			&NewUser{
				Email:        "John.Smith@testing.com",
				Password:     "moreThanAdaquate",
				PasswordConf: "moreThanAdaquate",
				UserName:     "Literal A Rebel",
				FirstName:    "John",
				LastName:     "Smith",
			},
			true,
		},
		{
			"Invalid username, userName contain multiple spaces",
			&NewUser{
				Email:        "John.Smith@testing.com",
				Password:     "moreThanAdaquate",
				PasswordConf: "moreThanAdaquate",
				UserName:     "    ",
				FirstName:    "John",
				LastName:     "Smith",
			},
			true,
		},
	}

	for _, c := range cases {
		err := c.newUser.Validate()
		if err != nil && !c.expectError {
			t.Errorf("Did not match expected output, wasn't expecting an error, but received one instead. Test Name: %s", c.name)
		}
		if err == nil && c.expectError {
			t.Errorf("Did not match expected output, was expecting an error, but passed instead. Test Name: %s", c.name)
		}
	}
}

// TestToUser is a test function for the user's ToUser
func TestToUser(t *testing.T) {
	cases := []struct {
		name        string
		newUser     *NewUser
		expectError bool
	}{
		{
			"Valid User 1",
			&NewUser{
				Email:        "MyEmailAddress@example.com ",
				Password:     "moreThanAdaquate",
				PasswordConf: "moreThanAdaquate",
				UserName:     "Adaquate",
				FirstName:    "John",
				LastName:     "Smith",
			},
			false,
		},
		{
			"Valid User 2 with spaces that need to trim",
			&NewUser{
				Email:        "       John.Smith@testing.com ",
				Password:     "moreThanAdaquate",
				PasswordConf: "moreThanAdaquate",
				UserName:     "Adaquate",
				FirstName:    "John",
				LastName:     "Smith",
			},
			false,
		},
		{
			"Invalid Email without at symbol",
			&NewUser{
				Email:        "testtesting.com",
				Password:     "moreThanAdaquate",
				PasswordConf: "moreThanAdaquate",
				UserName:     "Adaquate",
				FirstName:    "John",
				LastName:     "Smith",
			},
			true,
		},
		{
			"Password mismatch",
			&NewUser{
				Email:        "testtesting.com",
				Password:     "moreThanAdaquate",
				PasswordConf: "moreThanAdaquat",
				UserName:     "Adaquate",
				FirstName:    "John",
				LastName:     "Smith",
			},
			true,
		},
	}

	for _, c := range cases {
		user, err := c.newUser.ToUser()
		if err != nil && !c.expectError {
			t.Errorf("Did not match expected output, wasn't expecting an error, but received one instead. Test Name: %s", c.name)
		} else if err == nil && c.expectError {
			t.Errorf("Did not match expected output, was expecting an error, but passed instead. Test Name: %s", c.name)
		} else if err == nil && !c.expectError {
			md5Hash := md5.Sum([]byte(strings.ToLower(strings.Trim(c.newUser.Email, " "))))
			testPhotoURL := gravatarBasePhotoURL + fmt.Sprintf("%x", md5Hash[:])
			if strings.Compare(user.PhotoURL, testPhotoURL) != 0 {
				t.Errorf("Did not match expected output, was expecting %s, but received %s, test name: %s", testPhotoURL, user.PhotoURL, c.name)
			}
			err := bcrypt.CompareHashAndPassword(user.PassHash, []byte(c.newUser.Password))
			if err != nil {
				t.Errorf("Password hash do not match.")
			}
		}
	}
}

// TestFullName is a test function for the user's FullName
func TestFullName(t *testing.T) {

	cases := []struct {
		name     string
		newUser  *NewUser
		fullName string
	}{
		{
			"Both names present",
			&NewUser{
				Email:        "john.smith@testing.com",
				Password:     "moreThanAdaquate",
				PasswordConf: "moreThanAdaquate",
				UserName:     "Adaquate",
				FirstName:    "John",
				LastName:     "Smith",
			},
			"John Smith",
		},
		{
			"First name present",
			&NewUser{
				Email:        "johnS@testing.com",
				Password:     "moreThanAdaquate",
				PasswordConf: "moreThanAdaquate",
				UserName:     "Adaquate",
				FirstName:    "John",
				LastName:     "",
			},
			"John",
		},
		{
			"Last name present",
			&NewUser{
				Email:        "Jsmith@testing.com",
				Password:     "moreThanAdaquate",
				PasswordConf: "moreThanAdaquate",
				UserName:     "Adaquate",
				FirstName:    "",
				LastName:     "Smith",
			},
			"Smith",
		},
		{
			"No name present",
			&NewUser{
				Email:        "john.smith@testing.com",
				Password:     "moreThanAdaquate",
				PasswordConf: "moreThanAdaquate",
				UserName:     "Adaquate",
				FirstName:    "",
				LastName:     "",
			},
			"",
		},
		{
			"No name present from the get go",
			&NewUser{
				Email:        "john.smith@testing.com",
				Password:     "moreThanAdaquate",
				PasswordConf: "moreThanAdaquate",
				UserName:     "Adaquate",
			},
			"",
		},
	}

	for _, c := range cases {
		user, err := c.newUser.ToUser()
		if err != nil {
			t.Errorf("Did not expect an error here. Test Name: %s", c.name)
		} else {
			name := user.FullName()
			if name != c.fullName {
				t.Errorf("Did not match expected output, was expecting %s, but received %s, test name: %s", c.fullName, name, c.name)
			}
		}
	}

}

// TestAuthenticate is a test function for the user's Authenticate
func TestAuthenticate(t *testing.T) {
	cases := []struct {
		name                 string
		input                string
		expectedAuthenticate bool
	}{
		{
			"Correctly Inputted Password",
			"moreThanAdaquate",
			true,
		},
		{
			"Incorrectly Inputted Password",
			"moreThanCompetent",
			false,
		},
		{
			"Inputted Empty Password",
			"",
			false,
		},
		{
			"Inputted too short of a Password",
			"1234",
			false,
		},
		{
			"Long password with all spaces",
			"                                                                                            ",
			false,
		},
	}

	newUser :=
		&NewUser{
			Email:        "john.smith@testing.com",
			Password:     "moreThanAdaquate",
			PasswordConf: "moreThanAdaquate",
			UserName:     "Adaquate",
			FirstName:    "John",
			LastName:     "Smith",
		}
	user, err := newUser.ToUser()
	if err != nil {
		t.Errorf("Did not expect an error here.")
	}
	for _, c := range cases {
		err := user.Authenticate(c.input)
		if !c.expectedAuthenticate && err == nil {
			t.Errorf("Expected an error here, password was: %s, user input was: %s, test name: %s", newUser.Password, c.input, c.name)
		} else if c.expectedAuthenticate && err != nil {
			t.Errorf("Did not expect an error here, password was: %s, user input was: %s, test name: %s", newUser.Password, c.input, c.name)
		}
	}
}

// TestApplyUpdates is a test function for the user's ApplyUpdates
func TestApplyUpdates(t *testing.T) {

	cases := []struct {
		name             string
		update           *Updates
		expectedFullName string
	}{
		{
			"Update both names",
			&Updates{
				FirstName: "Johnny",
				LastName:  "Depp",
			},
			"Johnny Depp",
		},
		{
			"Empty update",
			&Updates{
				FirstName: "",
				LastName:  "",
			},
			"",
		},
		{
			"A nil struct",
			nil,
			"",
		},
		{
			"Make first name empty",
			&Updates{
				FirstName: "",
				LastName:  "Smith",
			},
			"Smith",
		},
		{
			"Make last name empty",
			&Updates{
				FirstName: "John",
				LastName:  "",
			},
			"John",
		},
		{
			"Empty struct",
			&Updates{},
			"",
		},
		{
			"Update first name only",
			&Updates{
				FirstName: "Johnny",
			},
			"Johnny",
		},
		{
			"Update last name only",
			&Updates{
				LastName: "Depp",
			},
			"Depp",
		},
		{
			"Invalid update",
			&Updates{
				FirstName: "John",
				LastName:  "Smith",
			},
			"John Smith",
		},
	}

	for _, c := range cases {
		newUser :=
			&NewUser{
				Email:        "john.smith@testing.com",
				Password:     "moreThanAdaquate",
				PasswordConf: "moreThanAdaquate",
				UserName:     "Adaquate",
				FirstName:    "John",
				LastName:     "Smith",
			}
		user, err := newUser.ToUser()
		if err != nil {
			t.Errorf("Did not expect an error here.")
		}
		err = user.ApplyUpdates(c.update)
		if c.name != "A nil struct" {
			if err != nil {
				t.Errorf("Did not expect an error here.")
			}
			name := user.FullName()
			if name != c.expectedFullName {
				t.Errorf("Did not match expected output, was expecting %s, but received %s, test name: %s", c.expectedFullName, name, c.name)
			}
		} else {
			if err == nil {
				t.Errorf("Expected an error here.")
			}
		}

	}

}
