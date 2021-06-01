import Form from "@rjsf/core";

const Form = JSONSchemaForm.default;

// type NewUser struct {
// 	Email        string `json:"email"`
// 	Password     string `json:"password"`
// 	PasswordConf string `json:"passwordConf"`
// 	UserName     string `json:"userName"`
// 	FirstName    string `json:"firstName"`
// 	LastName     string `json:"lastName"`
// }

const formSchema = {
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

const UIschema = {
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
  "password": {
    "ui:widget": "password",
    "ui:help": "Make sure the passwords match... "
  }
}

ReactDOM.render((
  <Form schema={formSchema} UIschema={UIschema}/>
), document.getElementById("app"));