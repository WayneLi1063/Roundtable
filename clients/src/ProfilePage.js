import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { albumBucketName, bucketRegion, AddPhoto } from './S3.js';

export default class Profile extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            display: 'profile',
            firstName: '',
            lastName: '',
            email: '',
            courses: '',
            nameErr: false,
            userPhotoFile: '',
            userPhoto: '',
            userName: '',
            authToken: localStorage.getItem("Authorization") || null
        }
    }

    // initial actions when component is created.
    componentDidMount() {
        this.props.toggleTwoButtons(false);
        this.setUserProfile();
        this.getCourse();
    }

    // actions when data is updated.
    componentDidUpdate(prevProps) {
        if (this.props.courses !== prevProps.courses) {
            this.setState(() => {
                return ({ courses: this.props.courses });
            })
        }
    }

    // decide to show the profile or edit tab
    toggleMenu = (tab) => {
        this.setState({ display: tab })
    }

    // handle clicks on cancel edit button
    cancelEdit = () => {
        this.setUserProfile();
    }

    // handle clicks on save change button
    submitEdit = () => {
        if (!this.state.authToken) {
            this.props.errorCallback("You are not authenticated")
            return;
        }
        this.setState({
            profileChanged: false,
        });
        if (this.state.firstName === '' && this.state.LastName === '') {
            this.setState({
                nameErr: true,
            });
        } else {
            this.setState({
                nameErr: false,
            })
            this.submitUpdate()
        }
    }

    submitUpdate = async () => {
        const update = {
            FirstName: this.state.firstName,
            LastName: this.state.lastName,
        }
        if (this.state.userPhotoFile !== '') {
            AddPhoto("UserFolder", this.state.userPhotoFile, this.state.userName, () => {
                this.props.setProfilePic()
            })
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
            this.props.errorCallback("error:" + response.status);
            return;
        } else {
            this.setUserProfile();
            this.toggleMenu('profile');
        }
    }

    // sets the authToken
    setAuthToken = (auth) => {
        localStorage.setItem("Authorization", auth)
        this.setState({authToken: auth});
    }

    // saves the user data
    setUser = (user) => {
        this.setState({user: user});
    }

    // fetch user information from the database
    setUserProfile = async () => {
        if (!this.state.authToken) {
            this.props.errorCallback("You are not authenticated.")
            return;
        }
        const response = await fetch(this.props.api.base + this.props.api.handlers.myuser + "me", {
            method: 'GET',
            headers: new Headers({
                "Authorization": this.state.authToken
            })
        });
        if (response.status >= 300) {
            this.props.errorCallback("error:" + response.status);
            return;
        }
        const user = await response.json()
        this.setState({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            url: user.photoURL,
            userName: user.userName,
            userPhoto: `https://${albumBucketName}.s3.${bucketRegion}.amazonaws.com/UserFolder/${user.userName}`
        })

    }

    // calls the course api to get user's current courses
    getCourse = async () => {
        if (!this.state.authToken) {
            this.props.errorCallback("You are not authenticated")
            return;
        }
        const response = await fetch("https://api.roundtablefinder.com/v1/courses/users", {
            method: 'GET',
            headers: new Headers({
                "Authorization": this.state.authToken
            })
        });
        if (response.status >= 300) {
            this.props.errorCallback("Get course failed. Please retry");
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

    // handle profile photo change when users edit their profiles
    handlePhoto = (event) => {
        this.setState({ 
            userPhotoFile: event.target.files[0],
            userPhoto: URL.createObjectURL(event.target.files[0])
        })
    }

    render() {
        let content = [];

        let courses = this.state.courses;
        if (courses.length !== 0) {
            courses.forEach(course => {
                if (course === "Please set up your current courses in profile page.") {
                    course = "Please set up your current courses by clicking the plus sign."
                }
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
                                    <h5 className="mb-3">{this.state.userName}</h5>
                                    <div className="row">
                                        <div className="user-profile ml-3">
                                            <h6>First Name</h6>
                                            <p>{this.state.firstName}</p>
                                            <h6>Last Name</h6>
                                            <p>{this.state.lastName}</p>
                                            <h6>Email</h6>
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
                            <img src={this.state.userPhoto} className="mx-auto img-fluid img-circle d-block user-img" alt="avatar"></img>
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
                            <img src={this.state.userPhoto} className="mx-auto img-fluid img-circle d-block user-img" alt="avatar"></img>
                            <div className="custom-file">
                                <input type="file" accept="image/*" className="custom-file-input" onChange={this.handlePhoto} />
                                <label className="custom-file-label">Upload a different photo</label>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }

    }
}