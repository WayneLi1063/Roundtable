import React from 'react';
import Form from "@rjsf/core";

var querystring = require('querystring');
var https = require('https');


export default class SignUp extends React.Component {
  constructor(props) {
    super(props)
  }

  formSchema = {
    "title": "Sign up",
    "description": "Enter basic information to create an account",
    "type": "object",
    "required": [
      "email",
      "password"
    ],
    "properties": {
      "email": {
        "type": "string",
        "title": "Email",
      },
      "password": {
        "type": "string",
        "title": "Password",
      }
    }
  }

  UIschema = {
    "email": {
      "ui:format": "email"
    },
    "password": {
      "ui:widget": "password"
    }
  }

  onSubmit = ({formData}, e) => {
    var post_options = {
      host: 'api.roundtablefinder.com',
      port: '443',
      path: '/v1/sessions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const setAuthToken = this.props.setAuthToken;
    const setUid = this.props.setUid;
    const setUser = this.props.setUser

    var post_req = https.request(post_options, (res) => {
      res.setEncoding('utf8');
      let auth = "";
      let uid = "";
      let user = {};
      res.on('data', function (chunk) {
          user = JSON.parse(chunk)
          console.log('Response: ' + chunk);
          auth = res.headers.authorization
          uid = user.uid
      });
      res.on('end', function () {
        setAuthToken(auth)
        setUid(uid)
        setUser(user)
      })
    });

    post_req.write(JSON.stringify(formData));
    post_req.end();
  }

  render() {
    return <Form schema={this.formSchema} UIschema={this.UIschema} onSubmit={this.onSubmit}/>
  }
}