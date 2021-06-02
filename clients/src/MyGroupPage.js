import React from 'react';
import FilteredCardList from './FilteredCardList.js';

export default class RenderMyGroups extends React.Component {
    componentDidMount() {
        this.props.toggleTwoButtons(true);
    }

    render() {
        let groups = [];
        if (this.props.cards) {
            Array.prototype.forEach.call(this.props.cards, group => {
                for (let member of group.members) {
                    if (member === this.props.user.uid) {
                        groups.push(group)
                        break;
                    }
                }
            })
        }

        return (
            <div>
                <FilteredCardList filterDisplay={this.props.filterDisplay} toggleFilter={this.props.toggleFilter} cards={this.props.cards} renderedCards={groups} fetch={this.props.fetch} updateCallback={this.props.updateCallback} toggleFeedback={this.props.toggleFeedback}feedbackInfo={this.props.feedbackInfo} passEditCallback={this.props.passEditCallback}feedbackDisplay={this.props.feedbackDisplay} user={this.props.user} h1Title={"My Current Groups"} errorCallback={this.props.errorCallback} loading={this.props.loading}/>
            </div>
        )
    }
}
