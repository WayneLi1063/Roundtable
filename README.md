## **Roundtable Project Proposal**



## **Project Description** 

As UW students, we often need to find study groups to understand new concepts, tackle hard problems, and build relationships. However, the pandemic has limited our ability to talk to people face-to-face, often there is no way to know your colleagues except in those awkward zoom breakout rooms. Additionally, remote courses and courses without mandatory sections will continue to exist post-pandemic, it is difficult to find study pals with similar schedules in these settings. Social anxiety can also be a factor that hurts students’ ability to find study groups. Therefore, we want to make that process easier by building an online study group finder. Students can create study groups that other students can join, or join groups that have been already created. They will also be able to browse the study groups by filtering for a specific class or section. In the group information page, students can share contact information, time schedule, and preferred collaboration methods.

We, the developers, had experienced these pain points as UW students and wished there were tools that facilitate group forming. This project will continue to be useful and help many students, and we believe it has enough complexities to make for a good final project.

 

## **Technical Description**

**Architectural Diagram Mapping** 

![img](https://user-images.githubusercontent.com/43760622/118579750-86f7a300-b743-11eb-9072-bff83e4eeb73.png)

 <br />

**Summary Table: All P0 are MVP user stories**

| Priority | User              | Description                                                  | Technical Implementation                                     |
| -------- | ----------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| P0       | As a user         | I want to create a group that advertises my interests with a representative image. | Store the filled out group information form encoded in **JSON** and send to the api gateway, then the gateway reroutes the request to the groups microservices, the group handlers stores the group info into a **MongoDB** database, websocket then fires off and tells all clients to update. The image storage solution is **AWS S3**. |
| P0       | As a user         | I want to look at a group's description and meeting time before I join. | By calling the GET and supplying the group id in the URL, the gateway reroutes the request to the groups microservices, the group handlers retrieves the info from **MongoDB** database, then sends the info back to frontend for display. |
| P0       | As a group admin  | I want to edit my group descriptions in the future.          | Validate the identity of the user as the group admin by local authToken, retrieved earlier from api server, and user info is contained in a **MySQL** user database. The api server then stores the filled out updated group information to the **MongoDB** database, encoded in **JSON**. |
| P0       | As a group admin  | I want to disband the group now that the quarter is finished. | Validate the identity of the user as the group admin by local authToken, retrieved earlier from api server, and user info is contained in a **MySQL** user database. Deletes the group entry from the **MongoDB** database. |
| P0       | As a group member | I want to leave the group because I think the group does not suit my interests / there is now a conflict in my schedule after I switched classes. | Validate the identity of the user as the group member by local authToken, retrieved earlier from api server, and user info is contained in a **MySQL** user database. Deletes the person from the list of members from the **MongoDB** database. |
| P1       | As a student      | I want to filter groups by course (INFO441) and the note exchange tag, so I can join groups that help me take notes in this class. | Retrieve all groups from the api server, which stored in a **MongoDB** database, then filters groups by checking the course and tags in **React** |
| P1       | As a student      | I want to set up courses that I am currently taking this quarter, so every time I create a group, I don't have to type in the courses. | Validate the identity of the user as a user by local authToken, retrieved earlier from api server, and user info is contained in a **MySQL** user database. **React** frontend will send the course string to the api server, and the server saves the information in the **MongoDB** database. |
| P1       | As a student      | I want to delete the courses in my profiles, now that I am done with this quarter. | Validate the identity of the user as a user by local authToken, retrieved earlier from api server, and user info is contained in a **MySQL** user database. **React** frontend will send the course string that user wants to delete to the api server, and the server deletes the enrollment information from the **MongoDB** database. |

 <br />

**List of available endpoints:**

*Sign up, sign in, sign out, edit user info for Users and Sessions*  

POST /users (Creates a new user)

GET /users/{id} (Returns the given user’s profile info, including contact info)

PATCH /users/{id} (Edits the given user’s first name and last name in profile)

POST /sessions (Starts a new session)

DELETE /sessions/mine (Ends the current session) 

 <br />

*Create, edit, delete for Groups*

POST /groups (Creates a new group)

GET /groups (Return all groups)

GET /groups/{id} (Returns a particular group’s info, including details such as descriptions and when2meet URL)

PATCH /groups/{id} (Edits the group’s info)

DELETE /groups/{id} (Deletes the group)

POST /groups/{id}/members (Adds a new member)

DELETE /groups/{id}/members/{id} (Deletes the member, both from admin removal, or member leaving the group)

POST /courses/users (Adds a new course to user's profile)

DELETE /courses/users (Deletes a course from user's profile) 

 <br />

**Database Schema:**

MySQL for Users (Go)
```
create table if not exists Users (
    id int not null auto_increment primary key,
    email varchar(320) not null unique,
    pass_hash varchar(255) not null,
    usr_name varchar(255) not null unique,
    first_name varchar(128) not null,
    last_name varchar(128) not null,
    photo_url varchar(2000) not null,
  	unique index idx_usr_name_email (usr_name, email)
);

create table if not exists UserLog (
    id int not null auto_increment primary key,
    usr_id int not null,
    signin_dt datetime not null,
    client_IP varchar(45)
);
```

Mongo for groups and courses (JavaScript)
```
const groupSchema = new Schema ({
    teamName: { type: String, required: true },
    className: { type: String, required: true },
    description: { type: String, required: false },
    private: { type : Boolean, required: true },
    creator:{ 
        type: {
            userID: Number,
            userEmail: String,
            }, 
        required: true
    },
    members: { type: [Number], required: true },
    createdAt: { type: Date, required: true },
    imgURL: { type: String, required: false },
    when2meetURL: { type: String, required: false },
    tags: { 
        type: {
            examSquad: Boolean,
            homeworkHelp: Boolean,
            noteExchange: Boolean,
            projectPartners: Boolean,
            labMates: Boolean
            }, 
        required: true
    },
    maxSize: { type: Number, required: true }
});

const enrollmentSchema = new Schema ({
    userID: { type: Number, required: true, unique: true },
    classList: { type: [String], required: true }
});
```

**Addendum for Updated Architecture**

![img](./readme_img/update_architecture.png?raw=true)
