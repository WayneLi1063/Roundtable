import React from 'react';
import Header from './Header.js';
import Footer from './Footer.js';
import Create from './Create.js';
import Edit from './Edit.js'
import Confirm from './Confirm.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import JoinCreateFeedback from './JoinCreateFeedback.js';
import AddCourses from './AddCourses.js'
import ProfilePage from './ProfilePage.js';
import MyGroupPage from './MyGroupPage.js';
import Homepage from './Homepage.js';
import { Route, Switch, Redirect } from 'react-router-dom';
import GroupDetailsPage from './GroupDetailsPage.js';
import { w3cwebsocket as W3CWebSocket } from "websocket";
import SignUp from './SignUp.js'
import Login from './Login.js'
import api from './APIEndpoints.js'
import { Card, Avatar, Input, Typography } from 'antd';

// WEBSOCKET
const { Search } = Input;
const client = new W3CWebSocket('ws://api.roundtablefinder.com:8000', 'echo-protocol');

export default class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            user: null,
            spinnerDisplay: false,
            myGroups: [],
            myCourses: [],
            currentCourses: '',
            currentPage: '',
            filterDisplay: false,
            createDisplay: false,
            editDisplay: false,
            errorDisplay: false,
            tempEditData: {},
            feedbackDisplay: false,
            feedbackInfo: [],
            popUpDisplay: false,
            addCourseDisplay: false,
            twoButtonDisplay: true,
            coverDisplay: false,
            groupCount: 0,
            errorMessage: '',
            authToken: localStorage.getItem("Authorization") || null
        }
    }

    getCurrentUser = async () => {
        if (!this.state.authToken) {
            this.toggleOnError("You are not authenticated.")
            return;
        }
        const response = await fetch(api.base + api.handlers.myuser + "me", {
            method: 'GET',
            headers: new Headers({
                "Authorization": this.state.authToken
            })
        });
        if (response.status >= 300) {
            this.toggleOnError("Authentication failed. Please relog.");
            this.setAuthToken("");
            this.setUser(null)
            return;
        }
        const user = await response.json()
        this.setState({user: user});
    }

    getCurrentGroups = async () => {
        if (!this.state.authToken) {
            return;
        }
        const response = await fetch(api.base + api.handlers.groups, {
            method: 'GET',
            headers: new Headers({
                "Authorization": this.state.authToken
            })
        });
        if (response.status >= 300) {
            this.toggleOnError("Retrieving group info failed. Please retry.");
            return;
        }
        const groups = await response.json()
        this.setState({myGroups: groups});
    }

    //WEBSOCKET
    valueChange = () => {
        client.send("update happened")
    }

    // fetch data from database and handles user sign in
    componentDidMount() {
        this.fetch();

        client.onopen = () => {
            console.log('Websocket Client Connected')
        }

        client.onmessage = (message) => {
            this.fetch();
        }

        // If user is authenticated
        if (this.state.authToken) {
            this.getCurrentUser();
            this.getCurrentGroups();
            this.getCourse();
        }
    }

    // Fetch the groups the user is currently enrolled and user's current attending courses in from json.
    fetch = async () => {
        this.setSpinnerOnDisplay();

        this.getCurrentUser();
        this.getCurrentGroups();
        this.getCourse();

        this.setSpinnerOffDisplay();
    }

    // This callback gets the current course enrollment of the user
    getCourse = async () => {
        if (!this.state.authToken) {
            this.toggleOnError("You are not authenticated.")
            return;
        }
        const response = await fetch("https://api.roundtablefinder.com/v1/courses/users", {
            method: 'GET',
            headers: new Headers({
                "Authorization": this.state.authToken
            })
        });
        if (response.status >= 300) {
            this.toggleOnError("Get course failed. Please retry");
            return;
        }
        const courses = await response.json()
        if (courses !== null) {
            this.setState({ myCourses: courses.classList });
        } else {
            this.setState({ myCourses: ["Please set up your current courses in profile page."] });
        }
    }

    // The callback function that allows Create form to submit a new group to app.
    submitCreateForm = async (newGroup) => {
        if (!this.state.authToken) {
            this.toggleOnError("You are not authenticated.")
            return;
        }

        const response = await fetch(api.base + api.handlers.groups, {
            method: 'POST',
            headers: new Headers({
                "Authorization": this.state.authToken,
                "Content-Type": "application/json"
            }),
            body: JSON.stringify(newGroup)
        });
        if (response.status >= 300) {
            this.toggleOnError(response.body);
            return;
        } else {
            this.valueChange()
        }
    }

    // The callback function that allows Edit form to submit edited group info to app.
    submitEditForm = async (card, _id) => {
        const response = await fetch(api.base + api.handlers.groups + "/" + _id, {
            method: 'PATCH',
            headers: new Headers({
                "Authorization": this.state.authToken,
                "Content-Type": "application/json"
            }),
            body: JSON.stringify(card)
        });
        if (response.status >= 300) {
            this.toggleOnError(response.body);
            return;
        } else {
            this.valueChange()
        }
    }

    // Sets React-FontAwesome spinner on.
    setSpinnerOnDisplay = () => {
        this.setState(() => {
            return { spinnerDisplay: true }
        })
    }

    // Sets React-FontAwesome spinner off.
    setSpinnerOffDisplay = () => {
        this.setState((prevState) => {
            return { spinnerDisplay: false }
        })
    }

    // Sets the Auth token for the current user
    setAuthToken = (auth) => {
        localStorage.setItem("Authorization", auth)
        this.setState(() => {
            return { authToken: auth };
        })
    }

    // Save user data to the state
    setUser = (user) => {
        this.setState(() => {
            return { user: user };
        })
    }

    // Toggle filter group form
    toggleFilter = () => {
        this.setState((prevState) => {
            return { filterDisplay: !prevState.filterDisplay }
        })
    }

    // Toggle create group form
    toggleCreateForm = () => {
        this.setState((prevState) => {
            return {
                createDisplay: !prevState.createDisplay,
                coverDisplay: !prevState.coverDisplay
            }
        })
    }

    // Toggle edit group form
    toggleEditForm = () => {
        this.setState((prevState) => {
            return {
                editDisplay: !prevState.editDisplay,
                coverDisplay: !prevState.coverDisplay
            }
        })
    }

    // Toggle the feedback popup window when "leave" button is clicked
    toggleFeedback = () => {
        this.setState((prevState) => {
            return { feedbackDisplay: !prevState.feedbackDisplay }
        })
    }

    // Change the state of current page
    togglePageTitle = (page) => {
        this.setState(() => {
            return { currentPage: page };
        })
    }

    // allows the card that needs to be update to communicate with Edit form.
    passEdit = (cardData) => {
        this.setState({
            tempEditData: cardData,
            editDisplay: true,
            coverDisplay: true
        })
    }

    // disbands the group
    disbandGroup = async (card) => {
        this.toggleEditForm();

        const response = await fetch(api.base + api.handlers.groups + "/" + card._id, {
            method: 'DELETE',
            headers: new Headers({
                "Authorization": this.state.authToken
            }),
        });
        if (response.status >= 300) {
            this.toggleOnError(response.body);
            return;
        } else {
            this.valueChange()
        }
    }

    // toggles the popup window when disbanding a group
    togglePopUp = () => {
        this.setState((prevState) => {
            return { popUpDisplay: !prevState.popUpDisplay };
        })
    }

    // toggles the add course menu
    toggleAddCourse = () => {
        this.setState((prevState) => {
            return {
                addCourseDisplay: !prevState.addCourseDisplay,
                coverDisplay: !prevState.coverDisplay
            }
        })
    }

    // will not show filter and create group buttons when on the profile page
    toggleTwoButtons = (state) => {
        this.setState({ twoButtonDisplay: state })
    }

    // allows child components to toggle error message when their fetch goes wrong
    toggleOnError = (errorObj) => {
        if (errorObj) {
            this.setState({
                errorDisplay: true,
                errorMessage: errorObj.message
            })
        }
    }

    render() {
        let content = null;
        if (!this.state.authToken || this.state.authToken === "null") {
            content = (
                <div>
                    <main>
                        <img className='loginLogo' src='img/loginLogo.png' alt='Round Table Logo'></img>
                        <div className='loginBG'>
                            <div className='login'>
                                <div className='login-form text-center container'>
                                        <div className="row justify-content-center">
                                            <div className="col">
                                                <SignUp setAuthToken={this.setAuthToken} setUser={this.setUser} errorCallback={this.toggleOnError}/>
                                            </div>
                                            <div className="col">
                                                <Login setAuthToken={this.setAuthToken} setUser={this.setUser} errorCallback={this.toggleOnError}/>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                    </main>
                </div>
            )
        } else {
            content = (
                <div>
                    <Header page={this.state.currentPage} togglePage={this.togglePageTitle} user={this.state.user} errorCallback={this.toggleOnError} setAuthToken={this.setAuthToken}/>
                    {this.state.coverDisplay &&
                        <div className="grey-cover"></div>
                    }
                    <main>
                        {this.state.twoButtonDisplay &&
                            <div>
                                <button id="options" onClick={this.toggleFilter}>Show Filter</button>
                                <button id="create" onClick={this.toggleCreateForm}>Create A Group</button>
                            </div>}
                        <Create createDisplay={this.state.createDisplay} toggleForm={this.toggleCreateForm} courseList={this.state.myCourses}
                            onSubmit={this.submitCreateForm} groupList={this.state.myGroups} toggleFeedback={this.toggleFeedback}
                            feedbackInfo={this.state.feedbackInfo} feedbackDisplay={this.state.feedbackDisplay} user={this.state.user} errorCallback={this.toggleOnError} />
                        {this.state.editDisplay &&
                            <Edit editData={this.state.tempEditData} editDisplay={this.state.editDisplay} toggleForm={this.toggleEditForm} courseList={this.state.myCourses}
                                onSubmit={this.submitEditForm} groupList={this.state.myGroups} onDisband={this.disbandGroup} togglePopUpForm={this.togglePopUp} user={this.state.user} errorCallback={this.toggleOnError} />
                        }
                        {this.state.popUpDisplay &&
                            <Confirm toggleConfirm={this.togglePopUp} confirmFunction={this.disbandGroup} cardData={this.state.tempEditData} confirmDisplay={this.state.popUpDisplay} />
                        }
                        {this.state.addCourseDisplay &&
                            <AddCourses toggleAddCourse={this.toggleAddCourse} courses={this.state.myCourses} user={this.state.user} getCourseCallback={this.getCourse} errorCallback={this.toggleOnError} wsUpdate={this.valueChange}/>
                        }
                        <JoinCreateFeedback feedbackDisplay={this.state.feedbackDisplay} toggleFeedback={this.toggleFeedback}
                            feedbackInfo={this.state.feedbackInfo} />

                        {this.state.errorDisplay &&
                            <div className="popup">
                                <p>{this.state.errorMessage + " Check your connection and refresh webpage."}</p>
                            </div>
                        }

                        <div className="bottom">
                            <Search
                            placeholder="input message and send"
                            enterButton="Send"
                            value={this.state.searchVal}
                            size="large"
                            onChange={(e) => this.setState({ searchVal: e.target.value })}
                            onSearch={value => this.valueChange()}
                            />
                        </div> 


                        <Switch>
                            <Route exact path='/myprofile' render={(props) => (<ProfilePage {...props} user={this.state.user} toggleAddCourse={this.toggleAddCourse} toggleTwoButtons={this.toggleTwoButtons} errorCallback={this.toggleOnError} authToken = {this.state.authToken} api = {api} getCurrentUser = {this.getCurrentUser} />)} />
                            <Route exact path='/mygroup' render={(props) => (<MyGroupPage {...props} cards={this.state.myGroups} loading={this.state.spinnerDisplay}
                                wsUpdate = {this.valueChange} updateCallback={this.updateAppState} toggleFeedback={this.toggleFeedback} user={this.state.user} toggleEditForm={this.toggleEditForm}
                                feedbackInfo={this.state.feedbackInfo} passEditCallback={this.passEdit} toggleTwoButtons={this.toggleTwoButtons} fetch={this.fetch}
                                feedbackDisplay={this.state.feedbackDisplay} filterDisplay={this.state.filterDisplay} toggleFilter={this.toggleFilter} errorCallback={this.toggleOnError} />)} />
                            <Route exact path='/home' render={(props) => (<Homepage {...props} wsUpdate = {this.valueChange} cards={this.state.myGroups} loading={this.state.spinnerDisplay}
                                updateCallback={this.updateAppState} toggleFeedback={this.toggleFeedback} user={this.state.user} fetch={this.fetch}
                                feedbackInfo={this.state.feedbackInfo} passEditCallback={this.passEdit} toggleTwoButtons={this.toggleTwoButtons}
                                feedbackDisplay={this.state.feedbackDisplay} filterDisplay={this.state.filterDisplay} toggleFilter={this.toggleFilter} errorCallback={this.toggleOnError} />)} />
                            <Route path='/group/:groupID' render={(props) => (<GroupDetailsPage {...props} wsUpdate = {this.valueChange} errorCallback={this.toggleOnError} toggleTwoButtons={this.toggleTwoButtons} user={this.state.user} />)} />
                            <Redirect to='/home' />
                        </Switch>

                        {this.state.spinnerDisplay &&
                            <div className="text-center">
                                <FontAwesomeIcon icon={faSpinner} size="lg" spin />
                            </div>
                        }
                    </main>
                    <Footer />
                </div>
            )
        }
        return content;
    }
}


