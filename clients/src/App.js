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
// import firebase from 'firebase/app';
// import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import ProfilePage from './ProfilePage.js';
import MyGroupPage from './MyGroupPage.js';
import Homepage from './Homepage.js';
import { Route, Switch, Redirect } from 'react-router-dom';
import GroupDetailsPage from './GroupDetailsPage.js';

export default class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            user: null,
            uid: null,
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
            errorMessage: ''
        }
    }

    // firebaseUiConfig = {
    //     signInOptions: [
    //         firebase.auth.EmailAuthProvider.PROVIDER_ID,
    //         firebase.auth.GoogleAuthProvider.PROVIDER_ID
    //     ],
    //     signInFlow: 'popup',
    //     callbacks: {
    //         signInSuccessWithAuthResult: () => false
    //     }
    // }

    // fetch data from database and handles user sign in
    componentDidMount() {
        this.fetch();

        // TODO: Change this into the auth we wrote

        // this.unregisterAuthObserver = firebase.auth().onAuthStateChanged(
        //     (user) => {
        //         if (user) {
        //             let userDataString = 'users/' + user.uid;
        //             let userRef = firebase.database().ref(userDataString);
        //             userRef.once("value", snapshot => {
        //                 let uid = user.uid
        //                 user.updateProfile({ photoURL: 'https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png' })
        //                 if (!snapshot.exists()) {
        //                     firebase.database().ref('users').child(uid).set({
        //                         uid: uid,
        //                         name: user.displayName,
        //                         email: user.email,
        //                         photoURL: 'https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png',
        //                         courses: {}
        //                     }, (errorObj) => {
        //                         if (errorObj) {
        //                             this.toggleOnError(errorObj);
        //                         }
        //                     })
        //                     this.toggleAddCourse();
        //                 }
        //                 firebase.database().ref('/users/' + uid).once('value', (snapshot) => {
        //                     let user = snapshot.val();
        //                     if (user) {
        //                         this.setState({ currentCourses: user.courses })
        //                     }
        //                 }, (errorObj) => {
        //                     if (errorObj) {
        //                         this.toggleOnError(errorObj);
        //                     }
        //                 });
        //             }, (errorObj) => {
        //                 if (errorObj) {
        //                     this.toggleOnError(errorObj);
        //                 }
        //             })
        //             this.setState({ user: user, uid: user.uid })
        //             this.fetch()
        //         } else {
        //             this.setState({ user: null, uid: null })
        //         }
        //     }
        // );
    }

    // unregister all listeners
    componentWillUnmount() {
        // this.rootRef.off();
        this.unregisterAuthObserver();
    }

    // Fetch the groups the user is currently enrolled and user's current attending courses in from json.
    fetch = () => {
        this.setSpinnerOnDisplay();

        // TODO: Change this into an api call.

        // this.rootRef = firebase.database().ref();
        // this.rootRef.on('value', (snapshot) => {
        //     let groupList = snapshot.val().groups;
        //     let count = snapshot.val().groupCount;
        //     let userList = snapshot.val().users;
        //     let groups = [];
        //     let courses = [];
        //     if (groupList) {
        //         let groupListArrKeys = Object.keys(groupList);
        //         groupListArrKeys.forEach((groupKey) => {
        //             groups.push(groupList[groupKey])
        //         })
        //     }
        //     if (userList && this.state.uid) {
        //         if (!userList[this.state.uid].courses) {
        //             courses = ["Please set up your current courses in profile page."]
        //         } else {
        //             courses = Object.values(userList[this.state.uid].courses);
        //         }
        //     }
        //     this.setState({
        //         myGroups: groups,
        //         groupCount: count,
        //         myCourses: courses,
        //         errorDisplay: false,
        //         errorMessage: ''
        //     })
        //     this.setSpinnerOffDisplay();
        // }, (errorObj) => {
        //     if (errorObj) {
        //         this.setSpinnerOffDisplay();
        //         this.toggleOnError(errorObj);
        //     }

        // })
    }

    // The callback function that allows Create form to submit a new group to app.
    submitCreateForm = (newGroup) => {
        // TODO: Change this into an api call.

        // newGroup.id = this.state.groupCount + 1;
        // this.rootRef.child("groups").child(newGroup.id).set(newGroup, (errorObj) => {
        //     if (errorObj) {
        //         this.toggleOnError(errorObj);
        //     }
        // });
        // this.rootRef.child("groupCount").set(this.state.groupCount + 1, (errorObj) => {
        //     if (errorObj) {
        //         this.toggleOnError(errorObj);
        //     }
        // });
        this.fetch()
    }

    // The callback function that allows Edit form to submit edited group info to app.
    submitEditForm = (card) => {
        // TODO: Change this into an api call.

        // this.rootRef.child("groups").child(card.id).set(card, (errorObj) => {
        //     if (errorObj) {
        //         this.toggleOnError(errorObj);
        //     }
        // });
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
    disbandGroup = (card) => {
        this.fetch()
        this.toggleEditForm();

        // TODO: Change this into an api call.

        // this.rootRef.child("groups").child(card.id).set(null, (errorObj) => {
        //     if (errorObj) {
        //         this.toggleOnError(errorObj);
        //     }
        // });
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
        if (errorObj)
            this.setState({
                errorDisplay: true,
                errorMessage: errorObj.message
            })
    }

    render() {
        let content = null;
        if (!this.state.user) {
            content = (
                <div>
                    <main>
                        <img className='loginLogo' src='img/loginLogo.png' alt='Round Table Logo'></img>
                        <div className='loginBG'>
                            <div className='login'>
                                {/* TODO: Change to our own auth */}
                                {/* <StyledFirebaseAuth uiConfig={this.firebaseUiConfig} firebaseAuth={firebase.auth()} /> */}
                            </div>
                        </div>
                    </main>
                </div>
            )
        } else {
            content = (
                <div>
                    <Header page={this.state.currentPage} togglePage={this.togglePageTitle} uid={this.state.uid} errorCallback={this.toggleOnError} />
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
                            <AddCourses toggleAddCourse={this.toggleAddCourse} courses={this.state.currentCourses} user={this.state.user} errorCallback={this.toggleOnError} />
                        }
                        <JoinCreateFeedback feedbackDisplay={this.state.feedbackDisplay} toggleFeedback={this.toggleFeedback}
                            feedbackInfo={this.state.feedbackInfo} />

                        {this.state.errorDisplay &&
                            <div className="popup">
                                <p>{this.state.errorMessage + " Check your connection and refresh webpage."}</p>
                            </div>
                        }

                        <Switch>
                            <Route exact path='/myprofile' render={(props) => (<ProfilePage {...props} user={this.state.user} toggleAddCourse={this.toggleAddCourse} toggleTwoButtons={this.toggleTwoButtons} errorCallback={this.toggleOnError} />)} />
                            <Route exact path='/mygroup' render={(props) => (<MyGroupPage {...props} cards={this.state.myGroups} loading={this.state.spinnerDisplay}
                                updateCallback={this.updateAppState} toggleFeedback={this.toggleFeedback} user={this.state.user} toggleEditForm={this.toggleEditForm}
                                feedbackInfo={this.state.feedbackInfo} passEditCallback={this.passEdit} toggleTwoButtons={this.toggleTwoButtons} fetch={this.fetch}
                                feedbackDisplay={this.state.feedbackDisplay} filterDisplay={this.state.filterDisplay} toggleFilter={this.toggleFilter} errorCallback={this.toggleOnError} />)} />
                            <Route exact path='/home' render={(props) => (<Homepage {...props} cards={this.state.myGroups} loading={this.state.spinnerDisplay}
                                updateCallback={this.updateAppState} toggleFeedback={this.toggleFeedback} user={this.state.user} fetch={this.fetch}
                                feedbackInfo={this.state.feedbackInfo} passEditCallback={this.passEdit} toggleTwoButtons={this.toggleTwoButtons}
                                feedbackDisplay={this.state.feedbackDisplay} filterDisplay={this.state.filterDisplay} toggleFilter={this.toggleFilter} errorCallback={this.toggleOnError} />)} />
                            <Route path='/group/:groupID' render={(props) => (<GroupDetailsPage {...props} errorCallback={this.toggleOnError} toggleTwoButtons={this.toggleTwoButtons} uid={this.state.uid} />)} />
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


