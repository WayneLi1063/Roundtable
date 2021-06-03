import React from 'react';
// import firebase from 'firebase/app';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons'
//import api from './APIEndpoints.js'

export default class Profile extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            display: 'profile',
            firstName: '',
            lastName: '',
            email: '',
            courses: '',
            // newPassword: '',
            // confirmPassword: '',
            passwordErr: false,
            nameErr: false,
            newPhoto: '',
            authToken: localStorage.getItem("Authorization") || null
        }
        // this.imgStorageRef = firebase.storage().ref("img");
    }

    // initial actions when component is created.
    componentDidMount() {
        this.props.toggleTwoButtons(false);
        this.setUserProfile();
        this.getCourse()
    }

    // disables all event listeners when component gets destoryed.
    componentWillUnmount() {
        //this.currentUserRef.off();
    }

    // decide to show the profile or edit tab
    toggleMenu = (tab) => {
        this.setState({ display: tab })
    }

    // handle clicks on cancel edit button
    cancelEdit = () => {
        this.setUserProfile();
    }

    validateEmail(email) {
        var re = /\S+@\S+\.\S+/;
        return re.test(String(email).toLowerCase());
    }

    // handle clicks on save change button
    submitEdit = () => {
        if (!this.state.authToken) {
            console.error("no auth token, aborting")
            return;
        }

        // let id = this.props.user.id;
        //if (this.state.newPassword === this.state.confirmPassword) {

        if (this.state.firstName === '' && this.state.LastName === '') {
            this.setState({
                nameErr: true,
            });
        } else {
            this.submitUpdate()
            //const user = await response.json()

            // firebase.database().ref('/users/' + uid).update({
            //     name: this.state.name,
            //     email: this.state.email
            // }, (errorObj) => {
            //     if (errorObj) {
            //         this.props.errorCallback(errorObj);
            //     }
            // })

            if (this.state.newPhoto !== '') {
                // TODO: Change the img handling process.

                // this.imgStorageRef.child(this.state.newPhoto.name).put(this.state.newPhoto).then(() => {
                //     this.imgStorageRef.child(this.state.newPhoto.name).getDownloadURL().then((url) => {
                //         this.props.user.updateProfile({ photoURL: url})
                //         firebase.database().ref('users').child(this.props.user.uid).update({
                //             photoURL: url
                //         })
                //         this.setState({ url: url })
                //     }).catch((errorObj) => {
                //         if (errorObj) {
                //             this.props.errorCallback(errorObj);
                //         }
                //     });
                // }).catch((errorObj) => {
                //     if (errorObj) {
                //         this.props.errorCallback(errorObj);
                //     }
                // });
            }

            this.setState({
                passwordErr: false,
                nameErr: false,
                emailErr: false,
                emailErr2: false
            })
            this.setUserProfile();
            this.toggleMenu('profile');
        }
        /*} else {
            this.setState({ passwordErr: true })
        }*/
    }

    submitUpdate = async () => {
        
        const update = {
            FirstName: this.state.firstName,
            LastName: this.state.lastName,
        }

        const response = await fetch("https://api.roundtablefinder.com/v1/users/me", {
            method: 'PATCH',
            headers: new Headers({
                "Authorization": this.state.authToken,
                "Content-Type": "application/json"
            }),
            body: JSON.stringify(update)
        });
        if (response.status >= 300) {
            console.error("error:" + response.status);
            return;
        } else {
            //this.props.wsUpdate()
        }

        // this.rootRef.child("groups").child(card.id).set(card, (errorObj) => {
        //     if (errorObj) {
        //         this.toggleOnError(errorObj);
        //     }
        // });
    }

    setAuthToken = (auth) => {
        localStorage.setItem("Authorization", auth)
        this.setState({authToken: auth});
    }

    setUser = (user) => {
        this.setState({user: user});
    }

    // fetch user information from the database
    setUserProfile = async () => {
        if (!this.state.authToken) {
            console.error("no auth token found, aborting")
            return;
        }
        const response = await fetch(this.props.api.base + this.props.api.handlers.myuser + "me", {
            method: 'GET',
            headers: new Headers({
                "Authorization": this.state.authToken
            })
        });
        if (response.status >= 300) {
            console.error("error:" + response.status);
            return;
        }
        const user = await response.json()
        this.setState({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            url: user.photoURL,
        })
    }

    getCourse = async () => {

        if (!this.state.authToken) {
            console.error("no auth")
            return;
        }
        const response = await fetch("https://api.roundtablefinder.com/v1/courses/users", {
            method: 'GET',
            headers: new Headers({
                "Authorization": this.state.authToken
            })
        });
        if (response.status >= 300) {
            console.error("Get course failed. Please retry");
            return;
        }
        const courses = await response.json()
        if (courses !== null) {
            this.setState({ courses: courses.classList });
        }
    }

    // handle name change when users edit their profiles
    handleFirstNameChange = (event) => {
        this.setState({ firstName: event.target.value })
    }

    handleLastNameChange = (event) => {
        this.setState({ lastName: event.target.value })
    }

    // handle email change when users edit their profiles
    handleEmailChange = (event) => {
        this.setState({ email: event.target.value })
    }

    // handle password change when users edit their profiles
    handlePassword = (event) => {
        this.setState({ newPassword: event.target.value })
    }

    // handle confirm password change when users edit their profiles
    handleConfirmPassword = (event) => {
        this.setState({ confirmPassword: event.target.value })
    }

    // handle profile photo change when users edit their profiles
    handlePhoto = (event) => {
        this.setState({ 
            newPhoto: event.target.files[0],
            url: URL.createObjectURL(event.target.files[0])
        })
    }

    render() {
        let content = [];

        let url = ""
        if (this.props.user !== null) {
            url = this.props.user.photoURL
        }

        let courses = this.state.courses;
        if (courses.length !== 0) {
            courses.forEach(course => {
                content.push(<div key={course} id="class-name" className={`class-name + ${course}`}> {course} </div>)
            })
        }

        if (this.state.display === 'profile') {
            return (
                <div className="container">
                    <div className="row my-2">
                        <div className="col-lg-8 order-lg-2">
                            <ul className="nav nav-tabs">
                                <li className="nav-item">
                                    <button onClick={() => this.toggleMenu('profile')} className="nav-link active">Profile</button>
                                </li>
                                <li className="nav-item">
                                    <button onClick={() => this.toggleMenu('edit')} className="nav-link">Edit</button>
                                </li>
                            </ul>
                            <div className="tab-content py-4">
                                <div className="tab-pane active" id="profile">
                                    <h5 className="mb-3">User Profile</h5>
                                    <div className="row">
                                        <div className="user-profile ml-3">
                                            <h6>firstName</h6>
                                            <p>{this.state.firstName}</p>
                                            <h6>LastName</h6>
                                            <p>{this.state.lastName}</p>
                                            <h6>E-mail</h6>
                                            <p>{this.state.email}</p>
                                            <h6>Current Courses</h6>
                                            <div className="my-courses">
                                                {content}
                                            </div>
                                            <FontAwesomeIcon icon={faPlusCircle} size="lg" className="mx-3 mt-1" onClick={this.props.toggleAddCourse} />
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                        <div className="col-lg-4 order-lg-1">
                            <img src={url} className="mx-auto img-fluid img-circle d-block user-img" alt="avatar"></img>
                        </div>
                    </div>
                </div>
            )
        } else {
            return (
                <div className="container">
                    <div className="row my-2">
                        <div className="col-lg-8 order-lg-2">
                            <ul className="nav nav-tabs">
                                <li className="nav-item">
                                    <button onClick={() => this.toggleMenu('profile')} className="nav-link">Profile</button>
                                </li>
                                <li className="nav-item">
                                    <button onClick={() => this.toggleMenu('edit')} className="nav-link active">Edit</button>
                                </li>
                            </ul>
                            <div className="tab-content py-4">
                                <div className="tab-pane active" id="edit">
                                    <form>
                                        <div className="form-group row">
                                            <label className="col-lg-3 col-form-label form-control-label">First Name</label>
                                            <div className="col-lg-9">
                                                <input className="form-control" type="text" value={this.state.firstName} onChange={this.handleFirstNameChange}></input>
                                            </div>
                                            {this.state.nameErr && <p className='name-err'>Name cannot be empty!</p>}
                                        </div>
                                        <div className="form-group row">
                                            <label className="col-lg-3 col-form-label form-control-label">Last Name</label>
                                            <div className="col-lg-9">
                                                <input className="form-control" type="text" value={this.state.lastName} onChange={this.handleLastNameChange}></input>
                                            </div>
                                            {this.state.nameErr && <p className='name-err'>Name cannot be empty!</p>}
                                        </div>
                                        <div className="form-group row">
                                            <label className="col-lg-3 col-form-label form-control-label"></label>
                                            <div className="col-lg-9">
                                                <input type="reset" className="btn btn-secondary mr-3" value="Cancel" onClick={this.cancelEdit}></input>
                                                <input type="button" className="btn btn-primary" value="Save Changes" onClick={this.submitEdit}></input>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 order-lg-1">
                            <img src={url} className="mx-auto img-fluid img-circle d-block user-img" alt="avatar"></img>
                            <div className="custom-file">
                                <input type="file" className="custom-file-input" onChange={this.handlePhoto} />
                                <label className="custom-file-label">Upload a different photo</label>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }

    }
}

/*
                                        <div className="form-group row">
                                            <label className="col-lg-3 col-form-label form-control-label">Email</label>
                                            <div className="col-lg-9">
                                                <input className="form-control" type="email" value={this.state.email} onChange={this.handleEmailChange}></input>
                                            </div>
                                            {this.state.emailErr && <p className='email-err'>Email cannot be empty!</p>}
                                            {this.state.emailErr2 && <p className='email-err'>Email is not validated!</p>}
                                        </div>

                                                

                                        */