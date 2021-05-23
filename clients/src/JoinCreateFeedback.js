import React from 'react';

// Provides feedback when users join or create a group
export default class JoinCreateFeedback extends React.Component {
    // Empty feedback content
    toggleEmptyFeedback = () => {
        this.props.toggleFeedback();
        this.props.feedbackInfo.pop();
        this.props.feedbackInfo.pop();
    }

    render() {
        return (
            <div>
                {this.props.feedbackDisplay &&
                    <div className="feedback-pop">
                        <form className="pop-container">
                            <p>You have sucessfully {this.props.feedbackInfo[0]} {this.props.feedbackInfo[1]}.</p>
                            <p>Please see MYGROUPS page to view your current groups.</p>
                            <div className="popCancel">
                                <button type="button" id="popCancel" className="btn cancel" onClick={this.toggleEmptyFeedback}>Close</button>
                            </div>
                        </form>
                    </div>
                }
            </div>
        )
    }
}