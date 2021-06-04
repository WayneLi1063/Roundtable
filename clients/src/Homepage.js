import React from 'react';
import FilteredCardList from './FilteredCardList.js';

export default class Homepage extends React.Component {
    componentDidMount() {
        this.props.toggleTwoButtons(true);
    }

    render() {
        let groups = [];
        if (this.props.cards && this.props.user) {
            this.props.cards.forEach((group) => {
                let userIsMember = false;
                for (let member of group.members) {
                    if (member === this.props.user.id) {
                        userIsMember = true;
                    }
                }
                if (!userIsMember) {
                    groups.push(group);
                }
            })    
        }

        return (
            <div>
                <FilteredCardList wsUpdate={this.props.wsUpdate} filterDisplay={this.props.filterDisplay} toggleFilter={this.props.toggleFilter} cards={this.props.cards} renderedCards={groups} fetch={this.props.fetch} updateCallback={this.props.updateCallback} toggleFeedback={this.props.toggleFeedback} feedbackInfo={this.props.feedbackInfo} passEditCallback={this.props.passEditCallback} feedbackDisplay={this.props.feedbackDisplay} user={this.props.user} h1Title={"Check Out These Amazing Groups!"} errorCallback={this.props.errorCallback} />
            </div>
        )
    }
}