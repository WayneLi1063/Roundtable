import React from 'react';
// import firebase from 'firebase/app';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons'

export default class AddCourses extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            courses: this.props.courses,
            newName: '',
            emptyAlertDisplay: false
        }
    }

    //called when component shows
    componentDidMount() {
        let uid = this.props.user.uid;

        // TODO: change to api call

        // this.courseRef = firebase.database().ref('/users/' + uid + '/courses');
        // this.courseRef.on('value', (snapshot) => {
        //     let courses = snapshot.val();
        //     this.setState({ courses: courses })
        // }, (errorObj) => {
        //     if (errorObj) {
        //         this.props.errorCallback(errorObj);
        //     }
        // })
    }

    // disable event listens.
    componentWillUnmount() {
        // this.courseRef.off();
    }

    //shows empty field alert
    showEmpty = () => {
        this.setState({ emptyAlertDisplay: true })
    }

    //hides empty field alert
    hideEmpty = () => {
        this.setState({ emptyAlertDisplay: false })
    }

    //delete a course from the user's list
    deleteCourse = (courseKey) => {
        let uid = this.props.user.uid;

        // TODO: change to api call

        // let courseRef = firebase.database().ref('/users/' + uid + '/courses/' + courseKey);
        // courseRef.remove()
    }

    //add a course to the user's list
    addOneCourse = (newCourseName) => {
        if (newCourseName === '') {
            this.showEmpty();
        } else {

            // TODO: change to api call

            // this.courseRef.update({
            //     [newCourseName]: newCourseName
            // }, (errorObj) => {
            //     if (errorObj) {
            //         this.props.errorCallback(errorObj);
            //     }
            // })
            // this.courseRef.on('value', (snapshot) => {
            //     let courses = snapshot.val();
            //     if (courses !== null) {
            //         this.setState({ courses: courses })
            //     }
            // }, (errorObj) => {
            //     if (errorObj) {
            //         this.props.errorCallback(errorObj);
            //     }
            // })
            this.hideEmpty();
        }
    }

    //handles the field change in the input component
    handleNameChange = (event) => {
        this.setState({
            newName: event.target.value
        })
    }

    //closes the pop up, and resets the input field
    handleSubmit = () => {
        this.props.toggleAddCourse();
        this.setState({
            newName: ''
        })
    }

    //renders the component
    render() {
        let content = [];
        let courses = this.state.courses;
        if (courses) {
            Object.keys(courses).forEach((key) => {
                content.push(<div key={key} className='course-tag'>
                    {courses[key]}
                    <FontAwesomeIcon icon={faTrashAlt} size="xs" className="white trash mt-1 mr-2" onClick={() => this.deleteCourse(key)} />
                </div>)
            })
        }
        
        return (
            <div>
                <div className='addCoursePopUp'>
                    <form className='addCourse-form-container'>
                        <h1>Setup your current courses</h1>
                        <label htmlFor="g-name" className="font-weight-bold">Add a course you are taking (EX. INFO340)</label><br />
                        {this.state.emptyAlertDisplay &&
                            <p className="alert-red alert-edit empty-field">This field cannot be empty.</p>
                        }
                        <div className='add-course-input-flex-container'>
                            <input type="text" id="addCourseInput" value={this.state.newName} onChange={this.handleNameChange} />
                            <button type="button" id="add-course" className="btn-add" onClick={() => { this.addOneCourse(this.state.newName) }}>Add</button>
                        </div>
                        <div className="course-list row">
                            {content}
                        </div>
                        <button type="button" id="add-course-2" className="btn-add-done" onClick={() => this.handleSubmit()}>Done</button>
                    </form>
                </div>
            </div>
        )
    }

}