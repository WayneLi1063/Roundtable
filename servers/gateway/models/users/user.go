package users

import (
	"crypto/md5"
	"fmt"
	"net/mail"
	"strings"

	"golang.org/x/crypto/bcrypt"
)

//gravatarBasePhotoURL is the base URL for Gravatar image requests.
//See https://id.gravatar.com/site/implement/images/ for details
const gravatarBasePhotoURL = "https://www.gravatar.com/avatar/"

//bcryptCost is the default bcrypt cost to use when hashing passwords
var bcryptCost = 13

//User represents a user account in the database
type User struct {
	ID        int64  `json:"id"`
	Email     string `json:"-"` //never JSON encoded/decoded
	PassHash  []byte `json:"-"` //never JSON encoded/decoded
	UserName  string `json:"userName"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	PhotoURL  string `json:"photoURL"`
}

//Credentials represents user sign-in credentials
type Credentials struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

//NewUser represents a new user signing up for an account
type NewUser struct {
	Email        string `json:"email"`
	Password     string `json:"password"`
	PasswordConf string `json:"passwordConf"`
	UserName     string `json:"userName"`
	FirstName    string `json:"firstName"`
	LastName     string `json:"lastName"`
}

//Updates represents allowed updates to a user profile
type Updates struct {
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
}

//Validate validates the new user and returns an error if
//any of the validation rules fail, or nil if its valid
func (nu *NewUser) Validate() error {
	email := nu.Email
	pwd := nu.Password
	pwdcnf := nu.PasswordConf
	Username := nu.UserName

	_, err := mail.ParseAddress(email)
	if err != nil {
		return fmt.Errorf("invalid email address")
	}

	if len(pwd) < 6 {
		return fmt.Errorf("invalid password, too short")
	}

	if pwd != pwdcnf {
		return fmt.Errorf("password confirmation does not match password")
	}

	if len(Username) == 0 || strings.Contains(Username, " ") {
		return fmt.Errorf("invalid username")
	}

	return nil
}

//ToUser converts the NewUser to a User, setting the
//PhotoURL and PassHash fields appropriately
func (nu *NewUser) ToUser() (*User, error) {

	err := nu.Validate()
	if err != nil {
		return nil, err
	}

	u := User{}
	u.Email = nu.Email
	u.FirstName = nu.FirstName
	u.LastName = nu.LastName
	u.SetPassword(nu.Password)
	u.UserName = nu.UserName
	u.ID = 0
	e := strings.Trim(nu.Email, " ")
	e = strings.ToLower(e)

	emailHash := md5.Sum([]byte(e))
	u.PhotoURL = gravatarBasePhotoURL + fmt.Sprintf("%x", emailHash[:])
	return &u, nil
}

//FullName returns the user's full name, in the form:
// "<FirstName> <LastName>"
//If either first or last name is an empty string, no
//space is put between the names. If both are missing,
//this returns an empty string
func (u *User) FullName() string {
	if u.FirstName == "" && u.LastName == "" {
		return ""
	}

	if u.FirstName == "" {
		return u.LastName
	}

	if u.LastName == "" {
		return u.FirstName
	}

	return u.FirstName + " " + u.LastName
}

//SetPassword hashes the password and stores it in the PassHash field
func (u *User) SetPassword(password string) error {
	if len(password) < 6 {
		return fmt.Errorf("password too short")
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(password), 13)
	if err != nil {
		return err
	}
	u.PassHash = hash
	return nil
}

//Authenticate compares the plaintext password against the stored hash
//and returns an error if they don't match, or nil if they do
func (u *User) Authenticate(password string) error {
	if len(password) < 6 {
		return fmt.Errorf("password too short")
	}
	err := bcrypt.CompareHashAndPassword(u.PassHash, []byte(password))
	if err != nil {
		return fmt.Errorf("autentication Failed")
	}

	return nil

}

//ApplyUpdates applies the updates to the user. An error
//is returned if the updates are invalid
func (u *User) ApplyUpdates(updates *Updates) error {
	if updates == nil {
		return fmt.Errorf("updates is invalid.")
	}

	u.FirstName = updates.FirstName
	u.LastName = updates.LastName

	return nil
}
