import React from 'react';
// import firebase from 'firebase/app';

// The form for "edit" button.
export default class Create extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            img: this.props.editData.img,
            groupName: this.props.editData.teamName,
            courseName: this.props.editData.className,
            description: this.props.editData.description,
            when2meetURL: this.props.editData.when2meetURL,
            private: this.props.editData.private,
            groupSize: this.props.editData.totalNumber,
            homeworkHelp: this.props.editData.homeworkHelp,
            examSquad: this.props.editData.examSquad,
            noteExchange: this.props.editData.noteExchange,
            labMates: this.props.editData.labMates,
            projectPartners: this.props.editData.projectPartners,
            emptyAlertDisplay: false,
            exceedCharDisplay: false,
            manyMemberDisplay: false,
            myCourses: this.props.courseList,
            authToken: localStorage.getItem("Authorization") || null
        }
        // this.imgStorageRef = firebase.storage().ref("img");
    }

    // updates course list prop when database fetches
    componentDidUpdate(prevProps) {
        if (this.props.courseList !== prevProps.courseList) {
            this.setState(() => {
                return ({ myCourses: this.props.courseList });
            })
        }
    }

    // Toggles an in-page alert when users submit an empty field
    toggleEmpty = () => {
        this.setState((prevState) => {
            return { emptyAlertDisplay: !prevState.emptyAlertDisplay }
        })
    }

    // Toggles an in-page alert when users submit a group name with more than 24 characters.
    toggleExceed = () => {
        this.setState((prevState) => {
            return { exceedCharDisplay: !prevState.exceedCharDisplay }
        })
    }

    // Toggles an in-page alert when users tries to lower group size past threshold,
    // which is the currently occupied number of people.
    toggleManyMember = () => {
        this.setState((prevState) => {
            return { manyMemberDisplay: !prevState.manyMemberDisplay }
        })
    }

    // Handles the user passed-in image.
    handleImgURLChange = (event) => {
        let newImg = event.target.files[0];
        this.setState({
            img: newImg
        });
    }

    // Handles the interaction when user types in group name field.
    handleGroupNameChange = (event) => {
        if (this.state.emptyAlertDisplay) {
            this.toggleEmpty();
        }
        if (this.state.exceedCharDisplay) {
            this.toggleExceed();
        }
        let newString = event.target.value;
        this.setState({
            groupName: newString
        });
    }

    // Handles the interaction when user selects an option in course name drop down.
    handleCourseNameChange = (event) => {
        let newValue = event.target.value;
        this.setState({
            courseName: newValue
        });
    }

    // Handles the interaction when user changes the group size slider.
    handleGroupSizeChange = (event) => {
        let newSize = event.target.value;
        this.setState({
            groupSize: newSize
        });
    }

    // Handles the interaction when user types in description field.
    handleDescriptionChange = (event) => {
        let newString = event.target.value;
        this.setState({
            description: newString
        });
    }

    // Handles the interaction when user types in description field.
    handleMeetChange = (event) => {
        let newString = event.target.value;
        this.setState({
            when2meetURL: newString
        });
    }

    // Handles the interaction when user checks the private button.
    handlePrivateChange = (event) => {
        this.setState((prevState) => {
            return { private: !prevState.private }
        })
    }

    // Handles the interaction when user selects the Homework Help option.
    handleHomeworkHelpChange = () => {
        this.setState((prevState) => {
            return { homeworkHelp: !prevState.homeworkHelp }
        })
    }

    // Handles the interaction when user selects Exam Squad option.
    handleExamSquadChange = () => {
        this.setState((prevState) => {
            return { examSquad: !prevState.examSquad }
        })
    }

    // Handles the interaction when user selects Note Exchange option.
    handleNoteExchangeChange = () => {
        this.setState((prevState) => {
            return { noteExchange: !prevState.noteExchange }
        })

    }

    // Handles the interaction when user selects Lab Mates option.
    handleLabMatesChange = () => {
        this.setState((prevState) => {
            return { labMates: !prevState.labMates }
        })
    }

    // Handles the interaction when user selects Project Partners option.
    handleProjectPartnersChange = () => {
        this.setState((prevState) => {
            return { projectPartners: !prevState.projectPartners }
        })
    }

    // Signifies what value the group size slider current is.
    handleGroupSizeOutput = (event) => {
        event.target.value = this.state.groupSize;
    }

    // Handles the create group funtion when user sumbits the edit form.
    handleSubmit = () => {
        let newGroup = {};
        if (this.state.groupName.length === 0) {
            this.toggleEmpty();
        } else if (this.state.groupName.length > 24) {
            this.toggleExceed();
        } else if (this.state.groupSize < this.props.editData.currNumber) {
            this.toggleManyMember();
        } else {
            // TODO: Change the img handling process.

            // if (typeof this.state.img !== "string") {
            //     this.imgStorageRef.child(this.state.img.name).put(this.state.img).then(() => {
            //         this.imgStorageRef.child(this.state.img.name).getDownloadURL().then((url) => {
            //             this.handleSubmitHelper(newGroup, url);
            //         }).catch((errorObj) => {
            //             this.props.errorCallback(errorObj);
            //         });
            //     }).catch((errorObj) => {
            //         this.props.errorCallback(errorObj);
            //     });
            // } else {
            this.handleSubmitHelper(newGroup, this.state.img);
            // }
            this.props.toggleForm();
        }
    }

    // The main interaction for handle submit
    handleSubmitHelper = (newGroup, url) => {
        newGroup.teamName = this.state.groupName;
        newGroup.className = this.state.courseName;
        newGroup.maxSize = parseInt(this.state.groupSize, 10);
        newGroup.createdAt = this.props.editData.createdAt;
        newGroup.creator = this.props.editData.creator;
        newGroup.description = this.state.description;
        newGroup.when2meetURL = this.state.when2meetURL;
        newGroup.private = this.state.private;
        newGroup.members = this.props.editData.members;
        newGroup.id = this.props.editData.id;
        newGroup.img = url;
        newGroup.tags = {
            homeworkHelp: this.state.homeworkHelp,
            examSquad: this.state.examSquad,
            noteExchange: this.state.noteExchange,
            labMates: this.state.labMates,
            projectPartners: this.state.projectPartners
        }
        this.props.onSubmit(newGroup);
    }

    // Handles the disband group funtion when user clicks on the disband function.
    handleDisband = () => {
        this.props.onDisband(this.props.editData);
    }

    // Renders an edit form for user to input.
    render() {
        let courseOptions = this.state.myCourses.map((course) => {
            return <option value={course} key={course}>{course}</option>
        })

        return (
            <div className="form-popup" id="edit-form">
                <form className="form-container">
                    <h1>Edit Group</h1>

                    <div className="form-group">
                        <label htmlFor="new-image" className="font-weight-bold">Upload New Image</label><br />
                        <input type="file" id="new-image" onChange={this.handleImgURLChange} accept="image/*" /><br />
                    </div>
                    <div className="form-group">
                        <label htmlFor="g-name" className="font-weight-bold">Group Name</label><br />
                        <input type="text" id="g-name" value={this.state.groupName} onChange={this.handleGroupNameChange} /><br />
                        {this.state.emptyAlertDisplay &&
                            <p className="alert-red alert-edit empty-field">This field cannot be empty.</p>
                        }
                        {this.state.exceedCharDisplay &&
                            <p className="alert-red alert-edit 24-char">This field cannot exceed 24 characters.</p>
                        }
                    </div>
                    <div className="form-group courseContainer" id="courseListEdit">
                        <label htmlFor="c-name" className="font-weight-bold">Course Name</label>
                        <select className="form-control" id="c-name" value={this.state.courseName} onChange={this.handleCourseNameChange}>
                            {courseOptions}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="g-descr" className="font-weight-bold">Group Name</label><br />
                        <input type="text" id="g-descr" value={this.state.description} onChange={this.handleDescriptionChange} /><br />
                    </div>
                    <div className="form-group">
                        <label htmlFor="g-meet" className="font-weight-bold">Group Name</label><br />
                        <input type="text" id="g-meet" value={this.state.when2meetURL} onChange={this.handleMeetChange} /><br />
                    </div>
                    <div className="form-group">
                        <label htmlFor="g-size" className="font-weight-bold">Group Size (2-5)</label><br />
                        <input type="range" name="g-size" max="5" min="2" id="g-size" className="g-size" value={this.state.groupSize} onChange={this.handleGroupSizeChange} />
                        <output className="ml-3" name="size-output" id="size-output">{this.state.groupSize}</output><br />
                        {this.state.manyMemberDisplay &&
                            <p className="alert-red alert-edit many-member">You have {this.props.editData.currNumber} members which exceeds desired group size.</p>
                        }
                    </div>

                    <div className="form-group">
                                <label htmlFor="g-descr" className="font-weight-bold">Group Description</label>
                                <input type="text" className="form-control" id="g-descr" value={this.state.description} onChange={this.handleDescriptionChange} />
                    </div>

                    <div className="form-group">
                        <div className="edit-form-group" aria-labelledby="goal-text">
                            <p className="form-check-label font-weight-bold" id="goal-text">Group Goal</p>
                            <div className="form-check">
                                <div className="row">
                                    <div className="col-6">
                                        <input className="form-check-input" type="checkbox" checked={this.state.homeworkHelp} onClick={this.handleHomeworkHelpChange}
                                            id="edit-goal-1" readOnly />
                                        <label className="form-check-label" htmlFor="edit-goal-1">Homework
                                                    Help</label>
                                    </div>
                                    <div className="col-6">
                                        <input className="form-check-input" type="checkbox" onClick={this.handleExamSquadChange} checked={this.state.examSquad}
                                            id="edit-goal-2" readOnly />
                                        <label className="form-check-label" htmlFor="edit-goal-2">Exam Squad</label>
                                    </div>
                                    <div className="col-6">
                                        <input className="form-check-input" type="checkbox" checked={this.state.noteExchange}
                                            id="edit-goal-3" onClick={this.handleNoteExchangeChange} readOnly />
                                        <label className="form-check-label" htmlFor="edit-goal-3">Note
                                                    Exchange</label>
                                    </div>
                                    <div className="col-6">
                                        <input className="form-check-input" type="checkbox" checked={this.state.labMates}
                                            id="edit-goal-4" onClick={this.handleLabMatesChange} readOnly />
                                        <label className="form-check-label" htmlFor="edit-goal-4">Lab Mates</label>
                                    </div>
                                    <div className="col-6">
                                        <input className="form-check-input" type="checkbox" checked={this.state.projectPartners}
                                            id="edit-goal-5" onClick={this.handleProjectPartnersChange} readOnly />
                                        <label className="form-check-label" htmlFor="edit-goal-5">Project
                                                    Partners</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <label htmlFor="leave">Disband the group?</label>
                    <button type="button" className="btn disband" id="leave" onClick={this.props.togglePopUpForm}>Disband</button>

                    <div class="form-check">
                                <input type="checkbox" class="form-check-input" 
                                    id="g-private" onClick={this.handlePrivateChange}/>
                                <label class="form-check-label" for="g-private">Private Group</label>
                    </div>

                    <div className="formButton">
                        <button type="button" id="submit-edit" className="btn save" onClick={this.handleSubmit}>Save</button>
                        <button type="button" id="cancel-edit" className="btn cancel" onClick={this.props.toggleForm}>Cancel</button>
                    </div>
                </form>
            </div>

        );
    }
}