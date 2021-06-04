import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons'

export default class AddCourses extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            courses: this.props.courses,
            newName: '',
            emptyAlertDisplay: false,
            authToken: localStorage.getItem("Authorization") || null
        }
    }

    // When the props gets updated, change the state as well
    componentDidUpdate(prevProps) {
        if (this.props.courses !== prevProps.courses) {
            this.setState(() => {
                return ({ courses: this.props.courses });
            })
        }
    }

    // Called when component shows
    componentDidMount() {
        this.props.getCourseCallback()
    }

    // disable event listens.
    componentWillUnmount() {

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
    deleteCourse = async (course) => {
        if (!this.state.authToken) {
            return;
        }
        const response = await fetch("https://api.roundtablefinder.com/v1/courses/users", {
            method: 'DELETE',
            headers: new Headers({
                "Authorization": this.state.authToken,
                "Content-Type": "application/json"
            }),
            body: JSON.stringify({course: course})
        });
        if (response.status >= 300) {
            this.props.errorCallback("Delete course failed. Please retry");
        } else {
            this.props.wsUpdate()
        }
    }

    //add a course to the user's list
    addOneCourse = async (newCourseName) => {
        if (newCourseName === '') {
            this.showEmpty();
        } else {
            if (!this.state.authToken) {
                this.props.errorCallback("You are not authenticated")
                return;
            }
            const response = await fetch("https://api.roundtablefinder.com/v1/courses/users", {
                method: 'POST',
                headers: new Headers({
                    "Authorization": this.state.authToken,
                    "Content-Type": "application/json"
                }),
                body: JSON.stringify({course: newCourseName})
            });
            if (response.status >= 300) {
                this.props.errorCallback("Add course failed. Please retry");
            } else {
                this.props.wsUpdate()
            }
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
        this.props.wsUpdate()
    }

    //renders the component
    render() {
        let content = [];
        let courses = this.state.courses;
        if (courses) {
            courses.forEach((course) => {
                if (course !== "Please set up your current courses in profile page.") {
                    content.push(<div className='course-tag'>
                    {course}
                    <FontAwesomeIcon icon={faTrashAlt} size="xs" className="white trash mt-1 mr-2" onClick={() => this.deleteCourse(course)} />
                </div>)
                }
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