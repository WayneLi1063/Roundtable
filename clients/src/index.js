import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import {BrowserRouter} from 'react-router-dom';
import * as serviceWorker from './serviceWorker';

// Change all these to database initialization

// import firebase from 'firebase/app';
// import 'firebase/auth';
// import 'firebase/database';
// import 'firebase/storage';

// const firebaseConfig = {
//     apiKey: "AIzaSyDT26tVl3IFCzI96rZTlP2_J40LkHRP3_o",
//     authDomain: "round-table-a62ad.firebaseapp.com",
//     databaseURL: "https://round-table-a62ad.firebaseio.com",
//     projectId: "round-table-a62ad",
//     storageBucket: "round-table-a62ad.appspot.com",
//     messagingSenderId: "1037437885077",
//     appId: "1:1037437885077:web:65af9b83c6f281deec999c",
//     measurementId: "G-0EECVGEW4V"
// };

// firebase.initializeApp(firebaseConfig);

ReactDOM.render(<BrowserRouter><App /></BrowserRouter>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
