## **Roundtable Project Proposal**



## **Project Description** 

As UW students, we often need to find study groups to understand new concepts, tackle hard problems, and build relationships. However, the pandemic has limited our ability to talk to people face-to-face, often there is no way to know your colleagues except in those awkward zoom breakout rooms. Additionally, remote courses and courses without mandatory sections will continue to exist post-pandemic, it is difficult to find study pals with similar schedules in these settings. Social anxiety can also be a factor that hurts students’ ability to find study groups. Therefore, we want to make that process easier by building an online study group finder. Students can create study groups that other students can join, or join groups that have been already created. They will also be able to browse the study groups by filtering for a specific class or section. In the group information page, students can share contact information, time schedule, and preferred collaboration methods.

We, the developers, had experienced these pain points as UW students and wished there were tools that facilitate group forming. This project will continue to be useful and help many students, and we believe it has enough complexities to make for a good final project.



## **Technical Description**

**Architectural Diagram Mapping** 

![img](https://lh4.googleusercontent.com/R2Da_YVtOBGv_d5gkcPn6whNBuY_Ndh8Z4Qh0C1hL8TO5aqwB-3VOxsgpi2CZFWLMtLLYyafLYAL-3DQguOp6W0kmIBahkWX_OLRq2mzzm4SNlOfJ6FYeTMjGiBtHkALNMh5nh5h)



**Summary Table: All P0 are MVP user stories**

| Priority | User              | Description                                                  | Technical Implementation                                     |
| -------- | ----------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| P0       | As a user         | I want to create a group and fill out my preferred meeting time. | Store the filled out group information form to the **MySQL** database, which will be in **JSON**, and returns the validated group info back to users’ browsers, and render the results using **React, HTML, and CSS**. |
| P0       | As a group admin  | I want to edit my group descriptions in the future.          | Validate the identity of the user as the group admin, store the filled out updated group information form to the **MySQL** database, which will be in **JSON**, and returns the validated group info back to users’ browsers, and render the results using **React, HTML, and CSS**. |
| P0       | As a group admin  | I want to disband the group now that the quarter is finished. | Validate the identity of the user as the group admin, and delete the group entry from the **MySQL** database. |
| P0       | As a group member | I want to leave the group because I think the group does not suit my interests / there is now a conflict in my schedule after I switched classes. | Validate the identity of the user as one of the members, and delete the person from the list of members from the **MySQL** database. |
| P0       | As a group admin  | I want to remove a member from the group because he or she no longer shows up and I want new members to join. | Validate the identity of the user as the group admin, and delete the person from the list of members from the **MySQL** database. |
| P1       | As a student      | I want to filter groups by group size and join a group with no more than 5 people, because I want to make close friends. | Look up groups with a form filled out by the user, send the form in **JSON** and search for suitable groups in **MySQL** database, compile all matches and send all the data back to users in **JSON**, then display them using **React, HTML and CSS**. |
| P1       | As a group admin  | I want to add tags to my study group, so it is more searchable. | Validate the identity of the user as the group admin, append tags (defined by us) to the current group within the groups table in **MySQL**.The tags we envisioned are: homework help, exam squad, lab mates, note exchange, project partners |

 

**List of available endpoints:**

Sign up, sign in, sign out, edit user info for Users and Sessions  

POST /users (Creates a new user)

GET /users/{id} (Returns the given user’s profile info, including stuff like contact info)

PATCH /users/{id} (Edits the given user’s profile info)

POST /sessions (Starts a new session)

DELETE /sessions/mine (Ends the current session)



Create, edit, delete for Groups

POST /groups (Creates a new group)

GET /groups (Given search filters, return suitable groups)

GET /groups/{id} (Returns a particular group’s info, including stuff like group size and name)

PATCH /groups/{id} (Edits the group’s info)

DELETE /groups/{id} (Deletes the group)

POST /groups/{id}/members (Adds a new member)

DELETE /groups/{id}/members/{id} (Deletes the member, both from admin removal, or member leaving the group)

POST /groups/{id}/tags/{id} (Adds a new tag to a particular group)

DELETE /groups/{id}/tags/{id} (Deletes the tag of a particular group)



**Database Schema:**

create table if not exists Users (

  *usr_id int not null auto_increment primary key,*

  email varchar(320) not null,

  pass_hash varchar(255) not null,

  first_name varchar(128) not null,

  last_name varchar(128) not null,

  photo_url varchar(2000) not null

);

 

create table if not exists Courses (

  courese_id int not null auto_increment primary key,

  course_name varchar(120) not null,

  course_abbr varchar(5) not null

)

 

create table if not exists Groups (

  group_id int not null auto_increment primary key,

  group_name varchar(300) not null,

  total_number int not null,

  curr_number int not null,

  exam_bool boolean not null,

  homework_bool boolean not null,

  note_bool boolean not null,

  project_bool boolean not null,

  photo_url varchar(2000) not null

)

 

create table if not exists Enrollments (

  enrollment_id int not null auto_increment primary key,

  usr_id int not null FOREIGN KEY REFERENCES Users(usr_id),

  group_id int not null FOREIGN KEY REFERENCES Groups(group_id)

)

 

create table if not exists Tags (

  tag_id int not null auto_increment primary key,

  tag_name varchar(120) not null

)

 

create table if not exists GroupTags (

  GroupTag_id int not null auto_increment primary key,

  tag_id int not null FOREIGN KEY REFERENCES Tags(tag_id),

  group_id int not null FOREIGN KEY REFERENCES Groups(group_id)

)

 

create unique index idx_usr_email

on Users (email)

 

create unique index idx_crs_abbr

on Courses (course_abbr)

 

create unique index idx_grp_name

on Groups (group_name)

 