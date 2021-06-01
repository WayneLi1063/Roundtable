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

const UIschema = {
  "email": {
    "ui:format": "email"
  },
  "password": {
    "ui:widget": "password"
  }
}

ReactDOM.render((
  <Form schema={formSchema} UIschema={UIschema}/>
), document.getElementById("app"));