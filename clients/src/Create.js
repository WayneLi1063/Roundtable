import React from 'react';
// import firebase from 'firebase/app';
const { CognitoIdentityClient } = require("@aws-sdk/client-cognito-identity");
const { fromCognitoIdentityPool, } = require("@aws-sdk/credential-provider-cognito-identity");
const { S3Client, PutObjectCommand, ListObjectsCommand, DeleteObjectCommand, DeleteObjectsCommand } = require("@aws-sdk/client-s3");

const albumBucketName = "roundtablefinder";
const bucketRegion = "us-west-1";
const IdentityPoolId = "us-west-1:28fdba59-1304-427e-8879-19f3d8c15844";

const s3 = new S3Client({
    region: bucketRegion,
    credentials: fromCognitoIdentityPool({
      client: new CognitoIdentityClient({ region: bucketRegion }),
      identityPoolId: IdentityPoolId, // IDENTITY_POOL_ID
    }),
  });

// List the photo albums that exist in the bucket
const listAlbums = async () => {
    try {
      const data = await s3.send(
          new ListObjectsCommand({ Delimiter: "/", Bucket: albumBucketName })
      );
  
      if (data.CommonPrefixes === undefined) {
        return ""
      } else {
        var albumNames = ""
        data.CommonPrefixes.map(function (commonPrefix) {
          var prefix = commonPrefix.Prefix;
          var albumName = decodeURIComponent(prefix.replace("/", ""));
          albumNames = albumNames + " " + albumName
        })
        return albumNames
        }
    } catch (err) {
      return alert("There was an error listing your albums: " + err.message);
    }
  };
  
  // Create an album in the bucket
const createAlbum = async (albumName) => {
    albumName = albumName.trim();
    if (!albumName) {
      return alert("Album names must contain at least one non-space character.");
    }
    if (albumName.indexOf("/") !== -1) {
      return alert("Album names cannot contain slashes.");
    }
    var albumKey = encodeURIComponent(albumName);
    try {
      const key = albumKey + "/";
      const params = { Bucket: albumBucketName, Key: key };
      const data = await s3.send(new PutObjectCommand(params));
      alert("Successfully created album.");
    } catch (err) {
      return alert("There was an error creating your album: " + err.message);
    }
  };

  // Add a photo to an album
const addPhoto = async (albumName, imgFile) => {
      const albumPhotosKey = encodeURIComponent(albumName) + "/";
      const data = await s3.send(
          new ListObjectsCommand({
            Prefix: albumPhotosKey,
            Bucket: albumBucketName
          })
      );
      const fileName = imgFile.name;
      const photoKey = albumPhotosKey + fileName;
      const uploadParams = {
        Bucket: albumBucketName,
        Key: photoKey,
        Body: imgFile
      };
      try {
        const data = await s3.send(new PutObjectCommand(uploadParams));
        console.log("Successfully uploaded photo.");
      } catch (err) {
        console.log("There was an error uploading your photo: ", err.message);
      }
}

// The form for "create a group" function.
export default class Create extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            img: '',
            groupName: '',
            description: '',
            courseName: '',
            when2meetURL: '',
            groupSize: 2,
            emptyAlertDisplay: false,
            emptyCourseDisplay: false,
            exceedCharDisplay: false,
            homeworkHelp: false,
            examSquad: false,
            noteExchange: false,
            labMates: false,
            projectPartners: false,
            private: false,
            myCourses: []
        }
        // this.imgStorageRef = firebase.storage().ref("img");
    }

    // updates course list prop when database fetches
    componentDidUpdate(prevProps) {
        if (this.props.courseList !== prevProps.courseList) {
            this.setState(() => {
                return ({ myCourses: this.props.courseList, courseName: this.props.courseList[0] });
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

    // Toggles an in-page alert when users didn't input current courses or encountered conncection error.
    toggleEmptyCourse = () => {
        this.setState((prevState) => {
            return { emptyCourseDisplay: !prevState.emptyCourseDisplay }
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

    // Handles the interaction when user selects the Homeeork Help option.
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

    // Handles the interaction when user changes the group size slider.
    handleGroupSizeChange = (event) => {
        let newSize = event.target.value;
        this.setState({
            groupSize: newSize
        });
    }

    // Signifies what value the group size slider current is.
    handleGroupSizeOutput = (event) => {
        event.target.value = this.state.groupSize;
    }

    // Handles the create group funtion when user sumbits the create form.
    handleSubmit = () => {
        let newGroup = {};
        if (this.state.groupName.length === 0) {
            this.toggleEmpty();
        } else if (this.state.groupName.length > 24) {
            this.toggleExceed();
        } else if (this.state.myCourses[0] === "Please set up your current courses in profile page.") {
            this.toggleEmptyCourse();
            // default img if user didn't upload image
        } else {
            // TODO: Change the image handling process

            if (this.state.img === '') {
                let url = "https://s3-us-west-2.amazonaws.com/uw-s3-cdn/wp-content/uploads/sites/81/2015/04/07090900/uw-block-w-statue-377x160.jpg"
                this.handleSubmitHelper(newGroup, url);
            } else {
                createAlbum("GroupPhotos")
                addPhoto("GroupPhotos", this.state.img)
                let url = `https://${albumBucketName}.s3.amazonaws.com/GroupPhotos/${this.state.img.fileName}`
                this.handleSubmitHelper(newGroup, url);
            }
            this.props.toggleForm();
        }
    }

    // update the state, display the appropriate information inside the feedback popup window
    handleSubmitHelper(newGroup, url) {
        newGroup.teamName = this.state.groupName;
        newGroup.className = this.state.courseName;
        newGroup.totalNumber = parseInt(this.state.groupSize, 10);
        //newGroup.createdAt = Date.now();
        newGroup.img = url
        newGroup.homeworkHelp = this.state.homeworkHelp
        newGroup.examSquad = this.state.examSquad
        newGroup.noteExchange = this.state.noteExchange
        newGroup.labMates = this.state.labMates
        newGroup.projectPartners = this.state.projectPartners
        newGroup.tags = {
            homeworkHelp: this.state.homeworkHelp,
            examSquad: this.state.examSquad,
            noteExchange: this.state.noteExchange,
            labMates: this.state.labMates,
            projectPartners: this.state.projectPartners
        }
        newGroup.description = this.state.description;
        newGroup.private = this.state.private;
        newGroup.when2meetURL = this.state.when2meetURL;
        this.props.onSubmit(newGroup);
        if (this.props.feedbackDisplay) {
            this.props.toggleFeedback();
            this.props.feedbackInfo.pop();
            this.props.feedbackInfo.pop();
            this.props.feedbackInfo.push("created");
            this.props.feedbackInfo.push(this.state.groupName);
            this.props.toggleFeedback();
        } else {
            this.props.feedbackInfo.push("created");
            this.props.feedbackInfo.push(this.state.groupName);
            this.props.toggleFeedback();
        }
        this.setState({
            img: '',
            groupName: ''
        });
    }

    // Renders a create form for user to input.
    render() {
        let courseOptions = this.state.myCourses.map((course) => {
            return <option value={course} key={course}>{course}</option>
        })

        return (
            <div>
                {this.props.createDisplay &&
                    <div className="form-popup" id="create-form">
                        <form className="form-container">
                            <h1>Create Group</h1>

                            <div className="form-group">
                                <label htmlFor="create-new-image" className="font-weight-bold">Upload New Image</label><br />
                                <input type="file" id="create-new-image" onChange={this.handleImgURLChange} accept="image/*" />
                            </div>

                            <div className="form-group">
                                <label htmlFor="create-group-name" className="font-weight-bold">Group Name</label>
                                <input type="text" className="form-control" id="create-group-name" value={this.state.groupName} onChange={this.handleGroupNameChange} />
                                {this.state.emptyAlertDisplay &&
                                    <p className="alert-red alert-create empty-field">This field cannot be empty.</p>
                                }
                                {this.state.exceedCharDisplay &&
                                    <p className="alert-red alert-create 24-char">This field cannot exceed 24 characters.</p>
                                }
                            </div>

                            <div className="form-group">
                                <div className="form-group course-container" id="courseList-create">
                                    <label htmlFor="create-course-name" className="font-weight-bold">Course Name</label>
                                    <select className="form-control select-field" id="create-course-name" onChange={this.handleCourseNameChange}>
                                        {courseOptions}
                                    </select>
                                    {this.state.emptyCourseDisplay &&
                                        <p className="alert-red alert-create empty-course">Empty current courses or connection error, please set up your courses in profile page, or refresh webpage.</p>
                                    }
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="create-group-descr" className="font-weight-bold">Group Description</label>
                                <input type="text" className="form-control" id="create-group-descr" value={this.state.description} onChange={this.handleDescriptionChange} />
                            </div>

                            <div className="form-group">
                                <label htmlFor="create-meet" className="font-weight-bold">When2meet URL</label>
                                <input type="text" className="form-control" id="create-meet" value={this.state.when2meetURL} onChange={this.handleMeetChange} />
                            </div>

                            <div className="form-group">
                                <label htmlFor="create-group-size" className="font-weight-bold">Group Size (2-5)</label><br />
                                <input type="range" name="create-group-size" max="5" min="2" id="create-group-size"
                                    className="g-size" value={this.state.groupSize} onChange={this.handleGroupSizeChange} />
                                <output className="ml-3" name="create-size-output" id="create-size-output">{this.state.groupSize}</output>
                            </div>

                            <div className="form-group">
                                <div className="create-form-group" aria-labelledby="goal-text">
                                    <p className="form-check-label font-weight-bold" id="goal-text">Group Goal</p>
                                    <div className="form-check">
                                        <div className="row">
                                            <div className="col-6">
                                                <input className="form-check-input" type="checkbox"
                                                    id="create-goal-1" onClick={this.handleHomeworkHelpChange} />
                                                <label className="form-check-label" htmlFor="create-goal-1">Homework
                                                    Help</label>
                                            </div>
                                            <div className="col-6">
                                                <input className="form-check-input" type="checkbox"
                                                    id="create-goal-2" onClick={this.handleExamSquadChange} />
                                                <label className="form-check-label" htmlFor="create-goal-2">Exam Squad</label>
                                            </div>
                                            <div className="col-6">
                                                <input className="form-check-input" type="checkbox"
                                                    id="create-goal-3" onClick={this.handleNoteExchangeChange} />
                                                <label className="form-check-label" htmlFor="create-goal-3">Note
                                                    Exchange</label>
                                            </div>
                                            <div className="col-6">
                                                <input className="form-check-input" type="checkbox"
                                                    id="create-goal-4" onClick={this.handleLabMatesChange} />
                                                <label className="form-check-label" htmlFor="create-goal-4">Lab Mates</label>
                                            </div>
                                            <div className="col-6">
                                                <input className="form-check-input" type="checkbox"
                                                    id="create-goal-5" onClick={this.handleProjectPartnersChange} />
                                                <label className="form-check-label" htmlFor="create-goal-5">Project
                                                    Partners</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="form-check">
                                <input type="checkbox" className="form-check-input" 
                                    id="create-private" onClick={this.handlePrivateChange}/>
                                <label className="form-check-label" htmlFor="create-private">Private Group</label>
                            </div>

                            <div className="form-button">
                                <button type="button" id="submit-create" className="btn save" onClick={this.handleSubmit}>Save</button>
                                <button type="button" id="cancel-create" className="btn cancel" onClick={this.props.toggleForm}>Cancel</button>
                            </div>
                        </form>
                    </div>
                }
            </div>
        );
    }
}