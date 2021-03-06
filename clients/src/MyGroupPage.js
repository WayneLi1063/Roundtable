import React from 'react';
import FilteredCardList from './FilteredCardList.js';

export default class RenderMyGroups extends React.Component {
    // make filter and create group appear
    componentDidMount() {
        this.props.toggleTwoButtons(true);
    }

    render() {
        let groups = [];
        if (this.props.cards && this.props.user) {
            this.props.cards.forEach((group) => {
                for (let member of group.members) {
                    if (member === this.props.user.id) {
                        groups.push(group)
                        break;
                    }
                }
            })
        }

        return (
            <div>
                <FilteredCardList wsUpdate={this.props.wsUpdate} filterDisplay={this.props.filterDisplay} toggleFilter={this.props.toggleFilter} cards={this.props.cards} renderedCards={groups} fetch={this.props.fetch} updateCallback={this.props.updateCallback} toggleFeedback={this.props.toggleFeedback}feedbackInfo={this.props.feedbackInfo} passEditCallback={this.props.passEditCallback}feedbackDisplay={this.props.feedbackDisplay} user={this.props.user} h1Title={"My Current Groups"} errorCallback={this.props.errorCallback} loading={this.props.loading}/>
            </div>
        )
    }
}
