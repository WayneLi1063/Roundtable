import React from 'react';
import Form from "@rjsf/core";

var https = require('https');


export default class SignUp extends React.Component {

  formSchema = {
    "title": "Sign up",
    "description": "Enter basic information to create an account",
    "type": "object",
    "required": [
      "email",
      "password",
      "passwordConf",
      "userName",
      "firstName",
      "lastName"
    ],
    "properties": {
      "email": {
        "type": "string",
        "title": "Email",
      },
      "password": {
        "type": "string",
        "title": "Password",
      },
      "passwordConf": {
        "type": "string",
        "title": "Confirm Password",
      },
      "userName": {
        "type": "string",
        "title": "Username",
      },
      "firstName": {
        "type": "string",
        "title": "First name",
      },
      "lastName": {
        "type": "string",
        "title": "Last name"
      },
    }
  }

  UIschema = {
    "email": {
      "ui:format": "email"
    },
    "firstName": {
      "ui:autofocus": true,
      "ui:emptyValue": "",
      "ui:autocomplete": "family-name"
    },
    "lastName": {
      "ui:emptyValue": "",
      "ui:autocomplete": "given-name"
    },
    "password": {
      "ui:widget": "password",
      "ui:help": "Hint: Make it strong!"
    },
    "passwordConf": {
      "ui:widget": "password",
      "ui:help": "Make sure the passwords match... "
    }
  }

  onSubmit = ({formData}, e) => {
    console.log(formData)
    console.log(JSON.stringify(formData))
    var post_options = {
      host: 'api.roundtablefinder.com',
      port: '443',
      path: '/v1/users',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    var post_req = https.request(post_options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
          console.log('Response: ' + chunk);
      });
    });

    post_req.write(JSON.stringify(formData));
    post_req.end();

  }

  render() {
    return <Form schema={this.formSchema} UIschema={this.UIschema} onSubmit={this.onSubmit}/>
  }
}