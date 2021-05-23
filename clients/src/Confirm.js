import React from 'react';

class Confirm extends React.Component {
    
    //this calls the confirm function in the props(what you want to do when you hit yes) and then disables the page.
    handleSumbitConfirm = () => {
        this.props.confirmFunction(this.props.cardData);
        this.props.toggleConfirm();
    }
    
    //renders the confirm pop up form
    render() {
        return (
            <div>
                {this.props.confirmDisplay && 
                <div className="confirm-popup" id="p-form">
                    <form className="confirm-container">
                        <h1>Are you sure?</h1>
                        <div className="confirm-button">
                            <button type="button" className="btn-yes" onClick={this.handleSumbitConfirm} >Yes</button>
                            <button type="button" className="btn-no" onClick={this.props.toggleConfirm} >No</button>
                        </div>
                    </form>
                </div>}
            </div>
        )
    }
}

export default Confirm;
