import React from 'react';
import Confirm from './Confirm.js';
import { Redirect } from 'react-router-dom';

const NOT_JOINED = 0; // This user doesn't belong in this group
const MEMBER = 1; // This user is a member
const LEADER = 2; // This user is a leader

class Card extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            confirmPopUp: false,
            shouldRedirect: false
        }
    }

    // handles the interaction when user wants to show details for a group.
    handleDetailClick = () => {
        this.setState({shouldRedirect: true});
    }

    //this is a toggle switch for confirm pop up window, it switchs the display of the popup everytime its called.
    toggleConfirm = () => {
        this.setState((prevState) => {
            return { confirmPopUp: !prevState.confirmPopUp };
        })
    }

    //this is a hub controller for all functions revolving a card.
    handleManageGroup = () => {
        if (this.props.feedbackDisplay && this.reportGroupStatus() === NOT_JOINED) {
            this.props.toggleFeedback();
            this.props.feedbackInfo.pop();
            this.props.feedbackInfo.pop();
            this.props.feedbackInfo.push("joined");
            this.props.feedbackInfo.push(this.props.cardData.teamName);
            this.props.toggleFeedback();
        } else if (this.reportGroupStatus() === NOT_JOINED) {
            this.props.feedbackInfo.push("joined");
            this.props.feedbackInfo.push(this.props.cardData.teamName);
            this.props.toggleFeedback();
        }

        if (this.reportGroupStatus() === LEADER) {
            this.props.editFunction(this.props.cardData);
        } else if (this.reportGroupStatus() === MEMBER) {
            this.toggleConfirm();
        } else {
            this.props.switchFunction(this.props.cardData);
        }
        this.props.fetch()
    }

    // returns the group status for this current user
    reportGroupStatus() {
        let members = this.props.cardData.members;
        let creator = this.props.cardData.creator;
        if (creator.userID === this.props.user.id) {
            return LEADER
        } else if (members.includes(this.props.user.id)){
            return MEMBER
        } else {
            return NOT_JOINED;
        }
    }

    // Returns a serie of icons to represent the current member status(joined / group size).
    getMemberIcons() {
        let iconIndicators = [];
        for (let i = 0; i < this.props.cardData.maxSize; i++) {
            if (i < this.props.cardData.members.length) {
                iconIndicators.push(true);
            } else {
                iconIndicators.push(false);
            }
        }

        let iconList = [];

        iconIndicators.forEach((indicator, index) => {
            let singleIcon = (
                this.getMemberIcon(indicator, index)
            )
            iconList.push(singleIcon);
        })

        return (
            <div className="team-viz">
                {iconList}
            </div>
        )
    }

    //Return one memeber icon, depending on the indicator, it can either be full or empty;
    getMemberIcon(indicator, index) {
        if (indicator) {
            return (
                <img src="img/mF.png" alt="member icon, occupied" aria-hidden="true" key={index}></img>
            )
        } else {
            return (
                <img src="img/mE.png" alt="member icon, occupied" aria-hidden="true" key={index}></img>
            )
        }
    }

    //return the correct status string in the card interaction button according to the status in the card's state.
    returnStatusString() {
        if (this.reportGroupStatus() === NOT_JOINED) {
            return "Join";
        } else if (this.reportGroupStatus() === MEMBER) {
            return "Leave";
        }
        return "Edit";
    }

    // If the user is the group founder, adds a crown icon next to the group name
    groupLeaderCrown() {
        if (this.reportGroupStatus() === LEADER) {
            return (<img className="leader" src="img/crown.svg" alt="You are leader"></img>);
        }
        return "";
    }

    // not display the group when the group is full
    displayStyleCheck() {
        if (this.props.cardData.members.length === this.props.cardData.maxSize && this.reportGroupStatus() === NOT_JOINED) {
            return { display: 'none' }
        } else {
            return { display: 'inline-block' }
        }
    }

    // Renders a single card (group) object.
    render() {
        if (this.state.shouldRedirect) {
            return <Redirect to={'/group/' + this.props.cardData._id} />
        }
        return (
            <div>
                <div className="flex-card">
                    <img id="g-img" src={this.props.cardData.imgURL} alt={"Group " + this.props.cardData.teamName} onClick={this.handleDetailClick} aria-haspopup="true"/>
                    <div className="card-content">
                        <div className="card-text">
                            <div className="group-name"> {this.props.cardData.teamName} </div>
                            {this.groupLeaderCrown()}
                            <div id="class-name" className={`class-name`}> {this.props.cardData.className} </div>
                        </div>

                        {this.getMemberIcons()}

                        <div className="group-info">
                            <div className="group-size">
                                Group of {this.props.cardData.maxSize}
                                <button className={this.returnStatusString().toLowerCase()} style={this.displayStyleCheck()} onClick={this.handleManageGroup}> {this.returnStatusString()} </button>
                            </div>
                            <div className="looking-for"> Looking for {this.props.cardData.maxSize - this.props.cardData.members.length} more</div>
                        </div>
                    </div>
                </div>
                <Confirm confirmDisplay={this.state.confirmPopUp} confirmFunction={this.props.confirmFunction} cardData={this.props.cardData}
                    toggleConfirm={this.toggleConfirm}></Confirm>
            </div>
        )
    }
}

export default Card;