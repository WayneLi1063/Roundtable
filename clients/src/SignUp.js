import React from 'react';
import Form from "@rjsf/core";
import api from './APIEndpoints.js';
import { AddPhoto } from './S3.js';

export default class SignUp extends React.Component {

  formSchema = {
    "title": "SIGN UP",
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

  // sends the needed sign up data to api server
  onSubmit = async ({formData}) => {
    const response = await fetch(api.base + api.handlers.users, {
      method: 'POST',
      headers: new Headers({
        "Content-Type": "application/json"
      }),
      body: JSON.stringify(formData)
    });
    if (response.status >= 300) {
        this.props.errorCallback("Sign up unsuccessful. Please retry.");
        return;
    }
    const user = await response.json()
    this.props.setUser(user);
    let currImg = user.photoURL
    AddPhoto("GroupPhotos", user.photoURL, user.userName)
    this.props.setAuthToken(response.headers.get("Authorization"));
  }

  render() {
    return <Form schema={this.formSchema} UIschema={this.UIschema} onSubmit={this.onSubmit}/>
  }
}