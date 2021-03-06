import React from 'react';
import { albumBucketName, bucketRegion, AddPhoto } from './S3.js'

// The form for "edit" button.
export default class Create extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            img: this.props.editData.imgURL,
            groupName: this.props.editData.teamName,
            courseName: this.props.editData.className,
            description: this.props.editData.description,
            when2meetURL: this.props.editData.when2meetURL,
            private: false,
            groupSize: this.props.editData.maxSize,
            homeworkHelp: this.props.editData.tags.homeworkHelp,
            examSquad: this.props.editData.tags.examSquad,
            noteExchange: this.props.editData.tags.noteExchange,
            labMates: this.props.editData.tags.labMates,
            projectPartners: this.props.editData.tags.projectPartners,
            emptyAlertDisplay: false,
            exceedCharDisplay: false,
            manyMemberDisplay: false,
            myCourses: this.props.courseList,
            authToken: localStorage.getItem("Authorization") || null
        }
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
        } else if (this.state.groupSize < this.props.editData.members.length) {
            this.toggleManyMember();
        } else {
            if (typeof this.state.img !== "string") {
                AddPhoto("GroupPhotos", this.state.img, this.state.img.name)
                let url = `https://${albumBucketName}.s3.${bucketRegion}.amazonaws.com/GroupPhotos/${this.state.img.name}`
                this.handleSubmitHelper(newGroup, url);
            } else {
                this.handleSubmitHelper(newGroup, this.state.img);
            }
            this.props.toggleForm();
        }
    }

    // The main interaction for handle submit
    handleSubmitHelper = (newGroup, url) => {
        newGroup.teamName = this.state.groupName;
        newGroup.className = this.state.courseName;
        newGroup.totalNumber = this.state.groupSize ? parseInt(this.state.groupSize, 10) : parseInt(this.props.editData.maxSize, 10);
        newGroup.description = this.state.description;
        newGroup.when2meetURL = this.state.when2meetURL;
        newGroup.private = this.state.private;
        newGroup.img = url;
        newGroup.homeworkHelp = this.state.homeworkHelp
        newGroup.examSquad = this.state.examSquad
        newGroup.noteExchange = this.state.noteExchange
        newGroup.labMates = this.state.labMates
        newGroup.projectPartners = this.state.projectPartners
        this.props.onSubmit(newGroup, this.props.editData._id);
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
                        <label htmlFor="g-descr" className="font-weight-bold">Description</label><br />
                        <input type="text" id="g-descr" value={this.state.description} onChange={this.handleDescriptionChange} /><br />
                    </div>
                    <div className="form-group">
                        <label htmlFor="g-meet" className="font-weight-bold">When2Meet URL</label><br />
                        <input type="text" id="g-meet" value={this.state.when2meetURL} onChange={this.handleMeetChange} /><br />
                    </div>
                    <div className="form-group">
                        <label htmlFor="g-size" className="font-weight-bold">Group Size (2-5)</label><br />
                        <input type="range" name="g-size" max="5" min="2" id="g-size" className="g-size" 
                        value={ this.state.groupSize ? this.state.groupSize : this.props.editData.maxSize } onChange={this.handleGroupSizeChange} />
                        <output className="ml-3" name="size-output" id="size-output">{this.state.groupSize}</output><br />
                        {this.state.manyMemberDisplay &&
                            <p className="alert-red alert-edit many-member">You have {this.props.editData.members.length} members which exceeds desired group size.</p>
                        }
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

                    <div className="formButton">
                        <button type="button" id="submit-edit" className="btn save" onClick={this.handleSubmit}>Save</button>
                        <button type="button" id="cancel-edit" className="btn cancel" onClick={this.props.toggleForm}>Cancel</button>
                    </div>
                </form>
            </div>

        );
    }
}