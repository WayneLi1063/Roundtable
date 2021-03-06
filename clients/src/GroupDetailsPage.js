import React from 'react';
import { Redirect } from 'react-router-dom';
import api from './APIEndpoints.js';
import { albumBucketName, bucketRegion, AddPhoto } from './S3.js';

const HOMEWORK_HELP = "homeworkHelp";
const EXAM_SQUAD = "examSquad";
const NOTE_EXCHANGE = "noteExchange";
const LAB_MATES = "labMates";
const PROJECT_PARTNERS = "projectPartners"


export default class GroupDetailsPage extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            user:null,
            userDataArray: [],
            leader: {},
            card: {},
            teamName: '',
            shouldRedirect: false,
            authToken: localStorage.getItem("Authorization") || null
        }
    }

    // handles the interaction when user wants to leave details page.
    handleDetailClick = () => {
        this.setState({ shouldRedirect: true });
    }

    // get members info when component is created
    componentDidMount() {
        this.props.toggleTwoButtons(false);
        let groupID = this.props.match.params.groupID;

        this.getCurrentUser()

        fetch(api.base + api.handlers.thisgroup + groupID)
        .then(res => res.json())
        .then(
            (result) => {
                if (result) {
                    let members = result.members
                    let leader = result.creator.userID
                    let teamName = result.teamName

                    if (members) {
                        this.getMembersInfo(members, leader)
                    }
                    
                    if (teamName) {
                        this.setState(() => {
                            return ({
                                card: result,
                                teamName: result.teamName
                            })
                        })
                    } 
                }
            }, (errorObj) => {
                if (errorObj) {
                    this.props.errorCallback(errorObj);
                }
            }
        )
    }

    // build the data arrays for group leader and memebers
    getMembersInfo = async (members, leader) => {
        if (!this.state.authToken) {
            this.props.errorCallback("no auth")
            return;
        }

        members.forEach(async (memberID) => {
            const response = await fetch(api.base + api.handlers.myuser + memberID, {
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
            if (memberID !== leader) {
                this.setState((prevState) => {
                    let memberArray = prevState.userDataArray
                    memberArray.push(user)
                    return {userDataArray: memberArray}
                })
            } else {
                this.setState({leader: user});
            }
        })
    }

    // pre-prosess member data
    buildUserDataArray = (userData) => {
        let dataArray = this.state.userDataArray
        dataArray.push(userData);
        this.setState({
            userDataArray: dataArray
        })
    }

    // fetches the current user info
    getCurrentUser = async () => {
        if (!this.state.authToken) {
            this.props.errorCallback("no auth token found, aborting")
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

    //renders the Group Detail Pop Up form
    render() {
        if (this.state.shouldRedirect && this.props.user) {
            if (this.state.card.members.includes(this.props.user.id)) {
                return <Redirect to='/mygroup' />
            } else {
                return <Redirect to='/home' />
            }
        }
        let card = this.state.card;
        let users = this.state.userDataArray
        let members = null;
        let content = null;
        let goals = null;

        //render the list of Members of the group
        members = (
            users.map((user) => {
                let userEmailString = ''
                if (!this.state.card.members.includes(this.state.user.id)) {
                    return (
                        <div key={user.id}>
                            <div className='memberRow'>
                                <img className="avatar" src={`https://${albumBucketName}.s3.${bucketRegion}.amazonaws.com/UserFolder/${user.userName}`} alt="User Profile"></img>
                                <p className='memberInfos'>
                                    {user.firstName + '\t' + user.lastName}
                                </p>
                            </div>
                        </div>
                    )
                }
                return (
                    <div key={user.id}>
                        <div className='memberRow'>
                            <img className="avatar" src={`https://${albumBucketName}.s3.${bucketRegion}.amazonaws.com/UserFolder/${user.userName}`} alt="User Profile"></img>
                            <p className='memberInfos'>
                                {user.firstName + '\t' + user.lastName}
                            </p>
                            <a className='sendEmailButton' href={'mailto: ' + user.email}>Email</a>
                        </div>
                    </div>
                )
            })
        )
        
        if (card) {
        //render the Goal Tags of the displayed group
        let tags = card.tags;
        if (tags) {
            goals = (
                Object.keys(tags).map((cardKey) => {
                    if (tags[cardKey] === true) {
                        if (cardKey === HOMEWORK_HELP) {
                            cardKey = "Homework Help";
                        } else if (cardKey === EXAM_SQUAD) {
                            cardKey = "Exam Squad";
                        } else if (cardKey === NOTE_EXCHANGE) {
                            cardKey = "Note Exchange";
                        } else if (cardKey === LAB_MATES) {
                            cardKey = "Lab Mates";
                        } else if (cardKey === PROJECT_PARTNERS) {
                            cardKey = "Project Partners";
                        }
                        return (
                            <div key={cardKey}>
                                <div className='goalTag'>
                                    {cardKey}
                                </div>
                            </div>
                        )
                    }
                    return content;
                })
            )
        }

        return (
            <section>
                <div className='detailsContainer'>
                    <h1 className='detailsTitle'>{card.teamName}</h1>
                    <button className='detailsCloseButton' onClick={this.handleDetailClick}>Close</button>
                    <div className="class-name-details" > {card.className} </div>
                    <div className="lookingFor"> Looking for {card.members ? card.maxSize - card.members.length : "fetching"} more</div><br/>
                    
                    <div>
                        <p className='membersTitle'>
                            Group Description: 
                        </p>
                        <div className='detailsContent' >{this.state.card.description ? this.state.card.description : <p>None</p>}</div>
                    </div>

                    <div>
                        <p className='membersTitle'>
                            Members:
                        </p>
                    </div>
                    <div className='memberList'>
                        {(typeof (this.state.leader) !== 'undefined') &&
                            <div>
                                <div key={this.state.leader.id}>
                                    <div className='memberRow'>
                                        <img className="avatar" src={`https://${albumBucketName}.s3.${bucketRegion}.amazonaws.com/UserFolder/${this.state.leader.userName}`} alt="User Profile"></img>
                                        <img className="detailsLeader" src="/img/crown.svg" alt="You are leader"></img>
                                        <p className='leaderInfos'>
                                            {this.state.leader.firstName + '\t' + this.state.leader.lastName}
                                        </p>
                                        <a className='sendEmailButton' href={'mailto: ' + this.state.leader.email}> Email</a>
                                    </div>
                                </div>
                                {members}
                            </div>}
                    </div>


                    <div>
                        <p className='membersTitle'>
                            Group Goal:
                        </p>
                        <div className='goalTagsContainer'>
                            {goals ? goals : <p>None</p>}
                        </div>
                    </div>
                    <div>
                        <p className='membersTitle'>
                            When2Meet URL: 
                        </p>
                        <div className='detailsContent' >{this.state.card.when2meetURL ? this.state.card.when2meetURL : <p>None</p>}</div>
                    </div>
                </div>
            </section>
        )
    }
}
}