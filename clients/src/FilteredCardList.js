import React from 'react';
import Card from './Card.js';

export default class FilteredCardList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            group: '',
            course: '',
            homeworkHelp: false,
            examSquad: false,
            noteExchange: false,
            labMates: false,
            projectPartners: false,
            cardList: this.props.renderedCards,
            fullGroup: false,
            fetched: false,
            applied: false,
            authToken: localStorage.getItem("Authorization") || null
        }
    }

    // updates card list prop when database fetches
    componentDidUpdate(prevProps) {
        if (this.props.renderedCards !== prevProps.renderedCards) {
            this.setState(() => {
                return ({ cardList: this.props.renderedCards });
            })
        }
    }

    // handles the appearance of course name field when user types in that field
    handleGroupChange = (event) => {
        let newValue = event.target.value
        this.setState({ group: newValue });
    }

    // handles the appearance of course name field when user types in that field
    handleCourseChange = (event) => {
        let newValue = event.target.value
        this.setState({ course: newValue });
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

    // handles the interaction when user selects "don't display full group" option.
    handleFullGroupChange = () => {
        this.setState((prevState) => {
            return { fullGroup: !prevState.fullGroup }
        })
    }

    // Signifies what value the group size slider current is.
    handleGroupSizeOutput = (event) => {
        event.target.value = this.state.groupSize;
    }

    // handles the refine request and puts the filtered card list into state.
    handleSubmitRefine = () => {
        this.setState({
            fetched: true,
            cardList: this.handleFilteringHelper()
        })
    }

    // handles the reset filter status and puts all groups back to the page.
    handleReset = () => {
        this.setState(() => {
            return ({
                group: '',
                course: '',
                homeworkHelp: false,
                examSquad: false,
                noteExchange: false,
                labMates: false,
                projectPartners: false,
                cardList: this.props.renderedCards,
                fullGroup: false,
                currentCard: null,
                applied: false
            })
        })
    }

    // returns the filtered group list according to user's input.
    handleFilteringHelper = () => {
        let renderCards = this.props.renderedCards;
        if (this.state.group !== '') {
            renderCards = renderCards.filter((card) => {
                return (card.teamName.toLowerCase().includes(this.state.group.toLowerCase()))
            })
        }
        if (this.state.course !== '') {
            renderCards = renderCards.filter((card) => {
                return (card.className.toLowerCase().includes(this.state.course.toLowerCase()));
            })
        }
        if (this.state.homeworkHelp) {
            renderCards = renderCards.filter((card) => {
                return (card.tags.homeworkHelp);
            })
        }
        if (this.state.examSquad) {
            renderCards = renderCards.filter((card) => {
                return (card.tags.examSquad);
            })
        }
        if (this.state.noteExchange) {
            renderCards = renderCards.filter((card) => {
                return (card.tags.noteExchange);
            })
        }
        if (this.state.labMates) {
            renderCards = renderCards.filter((card) => {
                return (card.tags.labMates);
            })
        }
        if (this.state.projectPartners) {
            renderCards = renderCards.filter((card) => {
                return (card.tags.projectPartners);
            })
        }
        if (this.state.fullGroup) {
            renderCards = renderCards.filter((card) => {
                return (card.members.length !== card.totalNumber);
            })
        }
        if (renderCards === this.props.renderedCards) {
            this.setState(() => {
                return ({ applied: false })
            })
        } else {
            this.setState(() => {
                return ({ applied: true })
            })
        }
        return renderCards;
    }

    // confirm user's decision on leaving the passed in study group.
    confirmLeave = async (card) => {
        if (!this.state.authToken) {
            this.props.errorCallback("You are not authenticated.")
            return;
        }
        const response = await fetch("https://api.roundtablefinder.com/v1/groups/" + card._id + '/members', {
            method: 'DELETE',
            headers: new Headers({
                "Authorization": this.state.authToken
            })
        })

        if (response.status >= 300) {
            this.props.errorCallback("leaving group failed. Please retry.");
            return;
        } else {
            this.props.wsUpdate()
        }
    }

    // Add the user to the group when they join the group
    joinGroup = async (card) => {
        if (!this.state.authToken) {
            this.props.errorCallback("You are not authenticated.")
            return;
        }
        const response = await fetch("https://api.roundtablefinder.com/v1/groups/" + card._id + '/members', {
            method: 'POST',
            headers: new Headers({
                "Authorization": this.state.authToken,
                "Content-Type": "application/json"
            }),
            body: JSON.stringify({id: this.props.user.id})
        })

        if (response.status >= 300) {
            this.props.errorCallback("Joining group failed. Please retry.");
            return;
        } else {
            this.props.wsUpdate()
        }
    }

    // Pops up an edit form when the user clicks "edit" button
    editGroup = (cardData) => {
        this.props.passEditCallback(cardData);
    }

    // change the currently displaying title, especially when there's no suitable match for filtering.
    toggleTitle() {
        return (<p>test</p>)
    }

    // renders the filter form
    render() {
        let listOfCards = [];
        let content = null;
        if (this.state.cardList) {
            listOfCards = this.state.cardList.map((eachCard) => {
                let singleCard = (
                    <Card cardData={eachCard} switchFunction={this.joinGroup} editFunction={this.editGroup} fetch={this.props.fetch}
                        toggleFeedback={this.props.toggleFeedback} feedbackInfo={this.props.feedbackInfo} feedbackDisplay={this.props.feedbackDisplay}
                        key={eachCard._id} confirmFunction={this.confirmLeave} user={this.props.user}
                        toggleEditForm={this.props.toggleEditForm} />
                )
                return singleCard;
            })
        }

        if (this.state.cardList.length === 0) {
            content = (
                <div>
                    <h4 className='text-center'>So Empty...</h4>

                </div>
            )


        } else {
            content = (
                <div className='flex-cards-container'>
                    {listOfCards}
                </div>
            )
        }

        return (
            <div className="more-options row">
                {this.props.filterDisplay &&
                    <div className="col-md-6 col-xl-3 filter-form">
                        <div className="side-bar">
                            <form className="px-3">
                                <div className="form-group">
                                    <label className="form-check-label" htmlFor="form-check-input-group">Group Name</label>
                                    <div>
                                        <input className="form-control" type="text" placeholder="Example: Geek"
                                            id="form-check-input-group" onChange={this.handleGroupChange} value={this.state.group} />
                                    </div>
                                </div>
                                <div className="dropdown-divider"></div>
                                <div className="form-group">
                                    <label className="form-check-label" htmlFor="form-check-input-course">Course</label>
                                    <div>
                                        <input className="form-control" type="text" placeholder="Example: Info 340"
                                            id="form-check-input-course" onChange={this.handleCourseChange} value={this.state.course} />
                                    </div>
                                </div>
                                <div className="dropdown-divider"></div>
                                <div className="form-group" aria-labelledby="goal-text">
                                    <p className="form-check-label" id="goal-text">Group Goal</p>
                                    <div className="form-check">
                                        <div className="row">
                                            <div className="col-6">
                                                <input className="form-check-input" type="checkbox" value="option1"
                                                    id="form-check-input-goal-1" onClick={this.handleHomeworkHelpChange} checked={this.state.homeworkHelp} readOnly />
                                                <label className="form-check-label" htmlFor="form-check-input-goal-1">Homework
                                                    Help</label>
                                            </div>
                                            <div className="col-6">
                                                <input className="form-check-input" type="checkbox" value="option2"
                                                    id="form-check-input-goal-2" onClick={this.handleExamSquadChange} checked={this.state.examSquad} readOnly />
                                                <label className="form-check-label" htmlFor="form-check-input-goal-2">Exam Squad</label>
                                            </div>
                                            <div className="col-6">
                                                <input className="form-check-input" type="checkbox" value="option3"
                                                    id="form-check-input-goal-3" onClick={this.handleNoteExchangeChange} checked={this.state.noteExchange} readOnly />
                                                <label className="form-check-label" htmlFor="form-check-input-goal-3">Note
                                                    Exchange</label>
                                            </div>
                                            <div className="col-6">
                                                <input className="form-check-input" type="checkbox" value="option4"
                                                    id="form-check-input-goal-4" onClick={this.handleLabMatesChange} checked={this.state.labMates} readOnly />
                                                <label className="form-check-label" htmlFor="form-check-input-goal-4">Lab Mates</label>
                                            </div>
                                            <div className="col-6">
                                                <input className="form-check-input" type="checkbox" value="option5"
                                                    id="form-check-input-goal-5" onClick={this.handleProjectPartnersChange} checked={this.state.projectPartners} readOnly />
                                                <label className="form-check-label" htmlFor="form-check-input-goal-5">Project
                                                    Partners</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {this.props.h1Title === "Check Out These Amazing Groups!" &&
                                    <div>
                                        <div className="dropdown-divider"></div>
                                        <div className="form-group" aria-labelledby="dont-display-full-text">
                                            <div className="form-check">
                                                <input className="form-check-input" type="checkbox"
                                                    id="form-check-input-full" onClick={this.handleFullGroupChange} checked={this.state.fullGroup} readOnly />
                                                <label className="form-check-label" htmlFor="form-check-input-full">Don't display full group</label>
                                            </div>
                                        </div>
                                    </div>
                                }
                                <button className="btn btn-primary search-button mr-3" type="button" onClick={this.handleSubmitRefine}>Refine Result</button>
                                <button className="btn btn-secondary search-button" type="button" onClick={this.handleReset}>Reset</button>
                                {this.state.applied &&
                                    <p className="applied-filter ml-2">Applied</p>
                                }
                            </form>
                        </div>
                    </div>}
                <section className="course-cards">
                    <h1 className="text-center title">{this.props.h1Title}</h1>
                    <p className="text-center">Click on group images to check details.</p>
                    {content}
                </section>
            </div>
        )
    }



}