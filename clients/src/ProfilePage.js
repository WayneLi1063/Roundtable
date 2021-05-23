import React from 'react';
// import firebase from 'firebase/app';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons'

export default class Profile extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            display: 'profile',
            name: '',
            email: '',
            courses: '',
            newPassword: '',
            confirmPassword: '',
            passwordErr: false,
            nameErr: false,
            emailErr: false,
            emailErr2: false,
            newPhoto: '',
            url: this.props.user.photoURL
        }
        // this.imgStorageRef = firebase.storage().ref("img");
    }

    // initial actions when component is created.
    componentDidMount() {
        this.props.toggleTwoButtons(false);
        this.setUserProfile();
    }

    // disables all event listeners when component gets destoryed.
    componentWillUnmount() {
        this.currentUserRef.off();
    }

    // decide to show the profile or edit tab
    toggleMenu = (tab) => {
        this.setState({ display: tab })
    }

    // handle clicks on cancel edit button
    cancelEdit = () => {
        this.setUserProfile();
        this.currentUserRef.once('value', (snapshot) => {
            let user = snapshot.val()
            if (user) {
                this.setState(() => {
                    return ({url: user.photoURL});
                })
            }
        }, (errorObj) => {
            if (errorObj) {
                this.props.errorCallback(errorObj);
            }
        });
        this.toggleMenu('profile');
    }

    validateEmail(email) {
        var re = /\S+@\S+\.\S+/;
        return re.test(String(email).toLowerCase());
    }

    // handle clicks on save change button
    submitEdit = () => {
        let uid = this.props.user.uid;
        if (this.state.newPassword === this.state.confirmPassword) {

            if (this.state.name === '' && this.state.email === '') {
                this.setState({
                    nameErr: true,
                    emailErr: true,
                    emailErr2: false
                });
            } else if (this.state.email === '' && this.state.name !== '') {
                this.setState({
                    nameErr: false,
                    emailErr: true,
                    emailErr2: false
                });
            } else if (this.state.email !== '' && this.state.name === '') {
                if (!this.validateEmail(this.state.email)) {
                    this.setState({
                        nameErr: true,
                        emailErr2: true,
                        emailErr: false
                    });
                } else {
                    this.setState({
                        nameErr: true,
                        emailErr: false,
                        emailErr2: false
                    });
                }
            } else {
                if (!this.validateEmail(this.state.email)) {
                    this.setState({
                        nameErr: false,
                        emailErr2: true,
                        emailErr: false
                    });
                } else {
                    if (this.state.newPassword !== '') {
                        this.props.user.updatePassword(this.state.newPassword);
                    }
                    // TODO: Change this into an api call.

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
            }
        } else {
            this.setState({ passwordErr: true })
        }
    }

    // fetch user information from the database
    setUserProfile = () => {
        // TODO: Change this into an api call.

        // let uid = this.props.user.uid;
        // this.currentUserRef = firebase.database().ref('/users/' + uid);
        // this.currentUserRef.on('value', (snapshot) => {
        //     let user = snapshot.val();
        //     if (user) {
        //         this.setState({
        //             name: user.name,
        //             email: user.email,
        //             url: user.photoURL
        //         })
        //         if (user.courses) {
        //             this.setState({ courses: user.courses })
        //         }
        //     }
        // }, (errorObj) => {
        //     if (errorObj) {
        //         this.props.errorCallback(errorObj);
        //     }
        // });
    }

    // handle name change when users edit their profiles
    handleNameChange = (event) => {
        this.setState({ name: event.target.value })
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
        let courses = this.state.courses;
        if (typeof courses !== "undefined") {
            Object.keys(courses).forEach((key) => {
                content.push(<div key={key} id="class-name" className={`class-name + ${courses[key]}`}> {courses[key]} </div>)
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
                                            <h6>Name</h6>
                                            <p>{this.state.name}</p>
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
                            <img src={this.state.url} className="mx-auto img-fluid img-circle d-block user-img" alt="avatar"></img>
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
                                            <label className="col-lg-3 col-form-label form-control-label">Name</label>
                                            <div className="col-lg-9">
                                                <input className="form-control" type="text" value={this.state.name} onChange={this.handleNameChange}></input>
                                            </div>
                                            {this.state.nameErr && <p className='name-err'>Name cannot be empty!</p>}
                                        </div>
                                        <div className="form-group row">
                                            <label className="col-lg-3 col-form-label form-control-label">Email</label>
                                            <div className="col-lg-9">
                                                <input className="form-control" type="email" value={this.state.email} onChange={this.handleEmailChange}></input>
                                            </div>
                                            {this.state.emailErr && <p className='email-err'>Email cannot be empty!</p>}
                                            {this.state.emailErr2 && <p className='email-err'>Email is not validated!</p>}
                                        </div>
                                        <div className="form-group row">
                                            <label className="col-lg-3 col-form-label form-control-label">New Password</label>
                                            <div className="col-lg-9">
                                                <input className="form-control" type="password" onChange={this.handlePassword}></input>
                                            </div>
                                        </div>
                                        <div className="form-group row">
                                            <label className="col-lg-3 col-form-label form-control-label">Confirm New Password</label>
                                            <div className="col-lg-9">
                                                <input className="form-control" type="password" onChange={this.handleConfirmPassword}></input>
                                            </div>
                                            {this.state.passwordErr && <p className='password-err'>Password doesn't match!</p>}
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
                            <img src={this.state.url} className="mx-auto img-fluid img-circle d-block user-img" alt="avatar"></img>
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