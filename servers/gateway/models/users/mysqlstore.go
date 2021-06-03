package users

import (
	"database/sql"
	"fmt"
	"time"

	_ "github.com/go-sql-driver/mysql"
)

//MysqlStore represents a user store backed by mySQL
type MysqlStore struct {
	db *sql.DB
}

//NewMysqlStore constructs a new MysqlStore
func NewMysqlStore(db *sql.DB) *MysqlStore {
	//initialize and return a new MysqlStore struct
	return &MysqlStore{db}
}

//Returns a user by getting the ID from the database, returns an error if the user does not exist
func (ms *MysqlStore) GetByID(id int64) (*User, error) {
	rows := ms.db.QueryRow("SELECT id, email, pass_hash, usr_name, first_name, last_name, photo_url FROM Users WHERE id=?", id)
	var email, userName, fName, lName, photo_url, pHash string
	var user User
	err := rows.Scan(&id, &email, &pHash, &userName, &fName, &lName, &photo_url)
	if err != nil {
		return nil, err
	}

	user = User{ID: id, Email: email, PassHash: []byte(pHash), UserName: userName, FirstName: fName, LastName: lName, PhotoURL: photo_url}

	return &user, nil
}

//Returns a user by getting the Email from the database, returns an error if the user does not exist
func (ms *MysqlStore) GetByEmail(email string) (*User, error) {
	rows := ms.db.QueryRow("SELECT id, email, pass_hash, usr_name, first_name, last_name, photo_url FROM Users WHERE email=?", email)
	var id int64
	var username, fName, lName, photo_url, pHash string
	var user User
	err := rows.Scan(&id, &email, &pHash, &username, &fName, &lName, &photo_url)
	if err != nil {
		return nil, err
	}

	user = User{ID: id, Email: email, PassHash: []byte(pHash), UserName: username, FirstName: fName, LastName: lName, PhotoURL: photo_url}

	return &user, nil
}

//Returns a user by getting the Username from the database, returns an error if the user does not exist
func (ms *MysqlStore) GetByUserName(username string) (*User, error) {
	rows := ms.db.QueryRow("SELECT id, email, pass_hash, usr_name, first_name, last_name, photo_url FROM Users WHERE usr_name=?", username)
	var id int64
	var email, fName, lName, photo_url, pHash string
	var user User
	err := rows.Scan(&id, &email, &pHash, &username, &fName, &lName, &photo_url)
	if err != nil {
		return nil, err
	}

	user = User{ID: id, Email: email, PassHash: []byte(pHash), UserName: username, FirstName: fName, LastName: lName, PhotoURL: photo_url}

	return &user, nil
}

//Inserts a new user into the user store and returns that user, returns an error if the user cannot be inserted or the id cannot be retrieved
func (ms *MysqlStore) Insert(user *User) (*User, error) {
	userCopy := user
	insq := "INSERT INTO Users(email, pass_hash, usr_name, first_name, last_name, photo_url) VALUES (?,?,?,?,?,?)"
	res, err := ms.db.Exec(insq, user.Email, user.PassHash, user.UserName, user.FirstName, user.LastName, user.PhotoURL)
	if err != nil {
		return nil, err
	}
	id, err := res.LastInsertId()
	if err != nil {
		return nil, err
	}
	userCopy.ID = id
	return userCopy, nil
}

//Updates the information about a user provided by ID and return the updated user, returns an erros if the update is illegal or the user does not exist
func (ms *MysqlStore) Update(id int64, updates *Updates) (*User, error) {
	user, err := ms.GetByID(id)
	if err != nil {
		return nil, err
	}

	err = user.ApplyUpdates(updates)
	if err != nil {
		return nil, err
	}

	_, err = ms.db.Exec("UPDATE Users SET first_name = ?, last_name = ? WHERE id = ?", updates.FirstName, updates.LastName, id)
	if err != nil {
		return nil, err
	}
	return user, nil
}

//Delete a user from the user store, returns an error if the user cannot be found
func (ms *MysqlStore) Delete(id int64) error {
	_, err := ms.db.Exec("DELETE FROM Users WHERE id=?", id)
	if err != nil {
		return err
	}
	return nil
}

//Logs a certain successful login attempt by its user id, time of login, and ip address of login
func (ms *MysqlStore) Log(id int64, ipAddr string) error {
	if len(ipAddr) > 45 {
		return fmt.Errorf("invalid ip address")
	}

	insq := "INSERT INTO UserLog(usr_id, signin_dt, client_IP) VALUES (?,?,?)"
	_, err := ms.db.Exec(insq, id, time.Now(), ipAddr)
	if err != nil {
		return err
	}
	return nil
}
