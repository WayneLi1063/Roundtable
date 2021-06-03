import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons'

export default class Footer extends React.Component {
    render() {
        return (
            <Router>
            <div>
                <footer> 
                    <div className="container">
                        <div className="row d-flex text-center justify-content-center github">
                            <a href="https://github.com/info340a-au19/project-StudyGroupFinder" aria-label="Get source code of this site from Github!"><FontAwesomeIcon icon={faGithub} size="lg" className="white mt-1" /></a>
                        </div>
                    </div>
                    <div className="container">
                        <div className="row d-flex text-center justify-content-center">
                            <div className="col-md-8 col-12 mt-4 mb-2">
                            <p className="footer-text">This web app is designed to help college students who would like to
                                create or join study groups based on their currently taking courses and study goals.
                                    </p>
                            </div>
                        </div>
                    </div>
                    <hr className="rgba-light" />
                    <div className="container">
                        <div className="d-flex text-center justify-content-center">
                            <div className="font-small">
                                <p>&copy; 2021 Wanye Li, Andi Ren, Aryan Varshney. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
            </Router>
        )
    }
}