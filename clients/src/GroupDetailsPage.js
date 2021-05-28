import React from 'react';
// import firebase from 'firebase/app';
import { Redirect } from 'react-router-dom';
import api from './APIEndpoints'

const HOMEWORK_HELP = "homeworkHelp";
const EXAM_SQUAD = "examSquad";
const NOTE_EXCHANGE = "noteExchange";
const LAB_MATES = "labMates";
const PROJECT_PARTNERS = "projectPartners"

export default class GroupDetailsPage extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            userDataArray: [],
            leader: [],
            card: [],
            teamName: '',
            shouldRedirect: false
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

        fetch(api.base + api.handlers.thisgroup + groupID)
        .then(res => res.json())
        .then(
            (result) => {
                if (result) {
                    let members = result.members
                    let leader = result.leader

                    if (members) {
                        this.getMembersInfo(members)
                    }
                    
                    if (leader) {
                        this.getLeaderInfo(leader)
                    }
                    
                    if (teamName) {
                        this.setState(() => {
                            return ({
                                card: result,
                                teamName: result.groupName
                            })
                        })
                    } 
                }
            }, (errorObj) = {
                if (errorObj) {
                    this.props.errorCallback(errorObj);
                }
            }
        )

        // TODO: Change this into an api call.

        // this.groupRef = firebase.database().ref("groups/").child(groupID);
        // this.groupRef.on("value", (snapshot) => {
        //     let group = snapshot.val();
        //     if (group) {
        //         let members = group.members;
        //         this.getMembersInfo(members);
        //         this.setState(() => {
        //             return ({ card: group, teamName: group.teamName })
        //         })
        //     }
        // }, (errorObj) => {
        //     if (errorObj) {
        //         this.props.errorCallback(errorObj);
        //     }
        // })
    }

    // unregister event listener when component is destroyed
    componentWillUnmount() {
        this.groupRef.off();
    }

    // build the data arrays for group leader and memebers
    getMembersInfo = (members) => {
        members.array.forEach(memberID => {
            fetch(api.base + api.handlers.thisgroup + memberID)
            .then(res => res.json())
            .then(
                (result) => {
                    if (result) {
                        this.setState((prevState) => {
                            let dataArray = prevState.userDataArray
                            dataArray.push(result)
                            return {
                                userDataArray: dataArray
                            }
                        })
                    }
                }, (errorObj) => {
                    if(errorObj) {
                        this.props.errorCallback(errorObj)
                    }
                }
            )
        })


        // TODO: Change this into an api call.

        // Object.keys(members).forEach((key) => {
        //     let userString = 'users/' + key;
        //     this.ref = firebase.database().ref(userString);
        //     if (!members[key]) {
        //         this.ref.on("value", (snapshot) => {
        //             this.setState((prevState) => {
        //                 let dataArray = prevState.userDataArray
        //                 dataArray.push(snapshot.val());
        //                 return {
        //                     userDataArray: dataArray
        //                 }
        //             }, (errorObj) => {
        //                 if (errorObj) {
        //                     this.props.errorCallback(errorObj);
        //                 }
        //             })
        //         })
        //     } else {
        //         this.ref.on('value', (snapshot) => {
        //             this.setState((prevState) => {
        //                 let leaderArray = prevState.leader
        //                 leaderArray.push(snapshot.val());
        //                 return {
        //                     leader: leaderArray
        //                 }
        //             })
        //         }, (errorObj) => {
        //             if (errorObj) {
        //                 this.props.errorCallback(errorObj);
        //             }
        //         })
        //     }
        // })
    }

    getLeaderInfo = (leader) => {
        fetch(api.base + api.handlers.thisgroup + leader)
        .then(res => res.json())
        .then(
            (result) => {
                if (result) {
                    this.setState(() => {
                        return {
                            leader: [result]
                        }
                    })
                }
            }, (errorObj) => {
                if(errorObj) {
                    this.props.errorCallback(errorObj)
                }
            }
        )
    }

    //pre-prosess member data
    buildUserDataArray = (userData) => {
        let dataArray = this.state.userDataArray
        dataArray.push(userData);
        this.setState({
            userDataArray: dataArray
        })
    }

    //renders the Group Detail Pop Up form
    render() {
        if (this.state.shouldRedirect) {
            let membersArr = Object.keys(this.state.card.members);
            if (membersArr.includes(this.props.uid)) {
                return <Redirect to='/mygroup' />
            } else {
                return <Redirect to='/home' />
            }
        }
        //render the list of Members of the group
        let users = this.state.userDataArray;
        let members = (
            users.map((user) => {
                let userEmailString = 'mailto: ' + user.email
                return (
                    <div key={user.uid}>
                        <div className='memberRow'>
                            <img className="avatar" src={user.photoURL} alt="User Profile"></img>
                            <p className='memberInfos'>
                                {user.name}
                            </p>
                            <a className='sendEmailButton' href={userEmailString}>Email</a>
                        </div>
                    </div>
                )
            })
        )

        //render the Goal Tags of the displayed group
        let card = this.state.card;
        let content = null
        let goals = (
            Object.keys(card).map((cardKey) => {
                if (card[cardKey] === true) {
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
        return (
            <section>
                <div className='detailsContainer'>
                    <h1 className='detailsTitle'>{this.state.card.teamName}</h1>
                    <button className='detailsCloseButton' onClick={this.handleDetailClick}>Close</button>
                    <div className="class-name-details" > {this.state.card.className} </div>
                    <div className="lookingFor"> Looking for {this.state.card.totalNumber - this.state.card.currNumber} more</div><br/>
                    <div>
                        <p className='membersTitle'>
                            Members:
                    </p>
                    </div>
                    <div className='memberList'>
                        {(typeof (this.state.leader[0]) !== 'undefined') &&
                            <div>
                                <div key={this.state.leader[0].uid}>
                                    <div className='memberRow'>
                                        <img className="avatar" src={this.state.leader[0].photoURL} alt="User Profile"></img>
                                        <img className="detailsLeader" src="/img/crown.svg" alt="You are leader"></img>
                                        <p className='leaderInfos'>
                                            {this.state.leader[0].name + '\t'}
                                        </p>
                                        <a className='sendEmailButton' href={'mailto: ' + this.state.leader[0].email}> Email</a>
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
                            {goals}
                        </div>
                    </div>
                </div>
            </section>
        )
    }

}