import React from 'react';
import {NavLink, Redirect} from 'react-router-dom';

export default class Header extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            display: false,
            page: this.props.page
        }
    }

    // Toggle dropdown menu display state
    toggleMenu = () => {
        this.setState((prevState) => {
            return {display: !prevState.display}
        })
    }

    // Change dropdown menu display style on smaller screens
    checkStyle() {
        if (this.state.display === true) {
            return {display: 'block'};
        }
        return {display: 'none'};
    }

    // handles the interaction after user clicks to go homepage
    handleHomePageClick = () => {
        this.setState({shouldRedirect: 'home'});
    }

    // hadnles the interaction after user clicks to go mygroup
    handleMyGroupClick = () => {
        this.setState({shouldRedirect: 'mygroup'});
    }

    render() {
        if (this.state.page !== '') {
            if (this.state.page === 'home') {
                this.props.togglePage('');
                return <Redirect to={'/home'} />
            } else {
                this.props.togglePage('');
                return <Redirect to={'/mygroup'} />
            }
        } 

        let url = ""
        if (this.props.user !== null) {
            url = this.props.user.photoURL
        }
        
        return (
            <div id="nav-search" className="sticky-top">
                <header>
                    <nav className="navbar">
                        <div className="logo row" onClick={this.handleHomePageClick}>
                            <NavLink to='/home'><img id="logo" src="/img/logo.png" alt="Logo" aria-label="Return to main page." /></NavLink>
                            <NavLink to='/home'><p className="h2" id="logo-text">Round Table</p></NavLink>
                        </div>
                        <div className="nav-search">
                            <div className="profile-setting">
                                <div className="nav-links">
                                    <NavLink to='/home' className="text-uppercase font-weight-bold" onClick={this.handleHomePageClick}
                                        >Homepage</NavLink>
                                    <NavLink to='/mygroup' className="text-uppercase font-weight-bold" onClick={this.handleMyGroupClick}
                                        >MyGroups</NavLink>
                                    <NavLink to='/myprofile' className="text-uppercase font-weight-bold">Profile</NavLink>
                                    <NavLink to='/' className="text-uppercase font-weight-bold" onClick={() => this.props.setAuthToken(null)}>Sign out</NavLink>
                                    <NavLink to='/myprofile'><img className="avatar" src={this.props.userPhoto}  alt="User Profile" /></NavLink>
                                </div>
                                
                                <div className="dropdown-mobile" onClick={this.toggleMenu}>
                                    <NavLink to='#' className="dropdown-toggle profile-link" role="button" id="dropdownMenuLink"
                                        data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><img
                                        className="avatar" src={url} alt="User Profile" /></NavLink>

                                    <div className="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuLink" style={this.checkStyle()}>
                                        <NavLink to='/home' onClick={this.handleHomePageClick} className="dropdown-item">Homepage</NavLink>
                                        <div className="dropdown-divider"></div>
                                        <NavLink to='/mygroup'  className="dropdown-item" onClick={this.handleMyGroupClick}>MyGroups</NavLink>
                                        <div className="dropdown-divider"></div>
                                        <NavLink to='/myprofile' className="dropdown-item" >Profile</NavLink>
                                        <div className="dropdown-divider"></div>
                                        {/* TODO: Change this to an api call. */}
                                        <NavLink to='/' className="dropdown-item signout" onClick={() => this.props.setAuthToken(null)}>Sign out</NavLink>
                                    </div>
                                    
                                </div>
                            </div>
                        </div>
                    </nav>
                </header>
            </div>
        )
    }
}