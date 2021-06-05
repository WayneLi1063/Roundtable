import React from 'react';
import Form from "@rjsf/core";
import api from './APIEndpoints.js'

export default class SignUp extends React.Component {

  formSchema = {
    "title": "LOG IN",
    "description": "Log in to your exisitng account",
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

  // sends the log in data to api server
  onSubmit = async ({formData}) => {
    const response = await fetch(api.base + api.handlers.sessions, {
      method: 'POST',
      headers: new Headers({
        "Content-Type": "application/json"
      }),
      body: JSON.stringify(formData)
    });
    if (response.status >= 300) {
        this.props.errorCallback("Log in unsuccessful. Please retry.");
        return;
    }
    const user = await response.json()
    this.props.setUser(user);
    this.props.setAuthToken(response.headers.get("Authorization"));
    this.props.fetch()
  }

  render() {
    return <Form schema={this.formSchema} UIschema={this.UIschema} onSubmit={this.onSubmit}/>
  }
}