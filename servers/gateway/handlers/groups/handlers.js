// TODO: Creates a new group with user as creator
const postGroupHandler = async (req, res, { Group }) => {
    const user = req.header('X-User')
    var userObject = ""
    try {
        userObject = JSON.parse(user)
    } catch (e) {
        res.status(400).send('Cannot parse JSON')
        return
    }
    const userID = userObject.id
    const userEmail = userObject.email
    const { 
        teamName, 
        className, 
        descrption, 
        private, 
        img, 
        when2meet,
        homeworkHelp,
        examSquad,
        noteExchange,
        labMates,
        projectPartners,
        totalNumber
    } = req.body;

    // check if the required fields are provided
    if (!teamName || !className || private === null || 
        homeworkHelp === null || examSquad === null ||
        noteExchange === null || labMates === null ||
        projectPartners === null || !totalNumber) {
        res.status(400).send("Must provide the requiured information");
    }

    // store the id and email of the creator
    const creator = {
        userID: userID,
        userEmail: userEmail
    }

    // log current time as created time
    const createdAt = new Date();

    const tags = {
        homeworkHelp,
        examSquad,
        noteExchange,
        labMates,
        projectPartners
    }

    // construct the group object
    const group = {
        groupName: teamName,
        className: className,
        descrption: descrption,
        private: private,
        creator: creator,
        members: [userID],
        createdAt: createdAt,
        imgURL: img,
        when2meetURL: when2meet,
        tags: tags,
        maxSize: totalNumber
    }

    // send query to database
    const query = new Group(group)
    query.save((err, newgroup) => {
        if (err) {
            res.status(500).send('Unable to create new group.');
            return;
        }

        res.set('Content-Type', 'application/json')
        res.status(201).json(newgroup);
    })
}

// TODO: Responds with all groups that fit the filters
const getGroupHandler = async (req, res, { Group }) => {
    try {
        const groups = await Group.find();
        res.set('Content-Type', 'application/json')
        res.status(200).json(groups)
    } catch (e) {
        res.status(500).send("unable to get groups")
    }
}

// TODO: Returns a specific group's info, if the user has permission
const getOneGroupHandler = async (req, res, { Group }) => {
    const groupID = req.params.groupID
    Group.findById(groupID, async (err, grp) => {
        if (err || grp === null) {
            res.status(400).send("Cannot find group")
            return
        }

        const user = req.header('X-User')
        var userObject = ""
        try {
            userObject = JSON.parse(user)
        } catch (e) {
            res.status(400).send('Cannot parse JSON')
            return
        }
        const userID = userObject.id

        if (grp.private && !grp.members.includes(userID)) {
            res.status(403).send("unauthorized")
            return;
        }

        try {
            res.set('Content-Type', 'application/json')
            res.status(200).json(grp)
        } catch (e) {
            res.status(500).send("unable to get the group")
        }
    })
}

// TODO: Updates a group's information
const patchOneGroupHandler = async (req, res, { Group }) => {
    // gets the groupID from the address
    const groupID = req.params.groupID

    //locate the target channel by id
    Group.findById(groupID, (err, foundGroup) => {
        if (err || foundGroup === null) {
            res.status(400).send('Cannot find group')
            return
        }
    
        const user = req.header('X-User')
        var userObject = ""
        try {
            userObject = JSON.parse(user)
        } catch (e) {
            res.status(400).send('Cannot parse JSON')
            return
        }
        const userID = userObject.id

        //see if the user is authorized to edit
        if (ch.creator.userID != userID) {
            res.status(403).send("unauthorized")
            return
        }

        const { 
            teamName, 
            className, 
            descrption, 
            private, 
            img,
            when2meet,
            homeworkHelp,
            examSquad,
            noteExchange,
            labMates,
            projectPartners,
            totalNumber
        } = req.body;

        // check if the required fields are provided
        if (!teamName || !className || private === null || 
            homeworkHelp === null || examSquad === null ||
            noteExchange === null || labMates === null ||
            projectPartners === null || !totalNumber) {
            res.status(400).send("Must provide the requiured information");
        }

        const tags = {
            homeworkHelp,
            examSquad,
            noteExchange,
            labMates,
            projectPartners
        }

        // construct the group object
        const newGroup = {
            groupName: teamName,
            className: className,
            descrption: descrption,
            private: private,
            creator: foundGroup.creator,
            members: foundGroup.members,
            createdAt: foundGroup.createdAt,
            imgURL: img,
            when2meetURL: when2meet,
            tags: tags,
            maxSize: totalNumber
        }

        //update group
        Group.findByIdAndUpdate(groupID, newGroup, {new: true}, (err, nGroup) => {
            if (err) {
                res.status(500).send('Unable to update group')
                return
            }

            res.set('Content-Type', 'application/json')
            res.status(201).json(nGroup)
        })
    })
}

// TODO: Disbands a group
const deleteOneGroupHandler = async (req, res, { Group }) => {
    // gets the groupID from the address
    const groupID = req.params.groupID

    //locate the target channel by id
    Group.findById(groupID, (err, foundGroup) => {
        if (err || foundGroup === null) {
            res.status(400).send('Cannot find group')
            return
        }
    
        const user = req.header('X-User')
        var userObject = ""
        try {
            userObject = JSON.parse(user)
        } catch (e) {
            res.status(400).send('Cannot parse JSON')
            return
        }
        const userID = userObject.id

        //see if the user is authorized to edit
        if (ch.creator.userID != userID) {
            res.status(403).send("unauthorized")
            return
        }

        //finders for group
        const groupFinder = {_id : groupID}

        //delete the group
        Group.deleteOne(groupFinder, (err) => {
            if (err) {
                res.status(500).send('Unable to delete group')
                return
            }

            res.status(200).send('Group disbanded.')
        })
    })
}

// TODO: adds a new member to the group
const postMemberHandler = async (req, res, { Group }) => {
    const groupID = req.params.groupID
    
    Group.findById(groupID, (err, grp) => {
        if (err || grp === null ) {
            res.status(400).send('Cannot find such group')
            return
        }

        const user = req.header('X-User')
        var userObject = ""
    
        try {
            userObject = JSON.parse(user)
        } catch (e) {
            res.status(400).send('Cannot parse JSON')
            return
        }
    
        const userID = userObject.id
        if (!userID) {
            res.status(401).send("User is not authenticated.")
            return
        }
        
        if (length(grp.members) === grp.maxSize) {
            res.status(400).send("Group already full")
            return;
        }

        const index = grp.members.indexOf(userID)
        if (index >= 0) {
            res.status(400).send("Member already exists.");
            return
        }

        //add the user from group
        const groupMembers = grp.members.concat(userID)
        
        Group.findByIdAndUpdate(groupID, {members: groupMembers}, (err, c) => {
            if (err) {
                res.status(500).send("Unable to join.");
                return;
            }

            res.status(201).send("joined successfully.");
        })
    })
}

// TODO: deletes the member from the channel if user is creator or the user themselves
const deleteMemberHandler = async (req, res, { Group }) => {
    const groupId = req.params.groupID
    
    Group.findById(groupID, (err, grp) => {
        if (err || grp === null ) {
            res.status(400).send('Cannot find such group')
            return
        }

        const user = req.header('X-User')
        var userObject = ""
    
        try {
            userObject = JSON.parse(user)
        } catch (e) {
            res.status(400).send('Cannot parse JSON')
            return
        }
    
        const userID = userObject.id
        if (!userID) {
            res.status(401).send("User is not authenticated.")
            return
        }
        
        if (userID === ch.creator.userID) {
            res.status(403).send("user is the creator")
            return;
        }

        const index = grp.members.indexOf(userID)

        if (index < 0) {
            res.status(400).send("User is not part of the group");
            return
        }

        //removes the user from group
        const groupMembers = grp.members.splice(index, 1)
        
        Group.findByIdAndUpdate(groupID, {members: groupMembers}, (err, c) => {
            if (err) {
                res.status(500).send("Unable to leave.");
                return;
            }

            res.status(201).send("left group successfully.");
        })
    })

    // // obtain the channelID
    // const channelID = req.params.channelID

    // // check if such channel exists and extracts the channel
    // Channel.findById(channelID, (err, ch) => {
    //     if (err || ch === null) {
    //         res.status(400).send('Cannot find such channel')
    //         return
    //     }

    //     const user = req.header('X-User')
    //     var userObject = ""
    //     try {
    //         userObject = JSON.parse(user)
    //     } catch (e) {
    //         res.status(400).send('Cannot parse JSON')
    //         return
    //     }
    //     const userID = userObject.id
        
    //     if (!userID) {
    //         res.status(401).send("User is not authenticated.")
    //         return
    //     }
    
    //     // check if the user is the channel creator
    //     if (userID !== ch.creator.userID) {
    //         res.status(403).send("user is not the channel creator")
    //         return;
    //     }

    //     const { id } = req.body;

    //     //check if id is provided
    //     if (!id) {
    //         res.status(400).send("Must provide the id of the member you want to delete");
    //         return
    //     }

    //     // find the index of the user we want to delete
    //     const index = ch.members.indexOf(id)
    //     if (index < 0) {
    //         res.status(400).send("Must provide valid id");
    //         return
    //     }

    //     // delete the user from the member list
    //     var channelMembers = ch.members
    //     channelMembers.splice(index, 1);

    //     Channel.findByIdAndUpdate(channelID, {members: channelMembers}, (err, ch) => {
    //         if (err) {
    //             res.status(500).send('Cannot remove')
    //             return
    //         }

    //         res.status(200).send('Member removed.')
    //     })
    // })
}

// TODO: gets a list of courses the user is taking
const getCourseHandler = async (req, res, { Enrollment }) => {
    // extract userID from X-User header
    const user = req.header('X-User')
    var userObject = ""
    try {
        userObject = JSON.parse(user)
    } catch (e) {
        res.status(400).send('Cannot parse JSON')
        return
    }
    const userID = userObject.id
    
    if (!userID) {
        res.status(401).send("User is not authenticated.")
        return
    }

    Enrollment.findByID(userID, (err, enr) => {
        // if there's an error or enrollment could not be found
        if (err || enr === null) {
            res.status(400).send('Cannot find enrollment by ID')
            return
        }

        res.set('Content-Type', 'application/json')
        res.status(200).json(enr)
    })
}

// TODO: adds a course to the list of courses the user is taking
const postCourseHandler = async (req, res, { Enrollment }) => {
    // extract user from X-User header
    const user = req.header('X-User')
    var userObject = ""
    try {
        userObject = JSON.parse(user)
    } catch (e) {
        res.status(400).send('Cannot parse JSON')
        return
    }
    const userID = userObject.id
    
    if (!userID) {
        res.status(401).send("User is not authenticated.")
        return
    }
    
    // // extract the enrollment
    Enrollment.findByID(userID, (err, enr) => {
        // if there's an error or enrollment could not be found
        if (err || enr === null) {
            res.status(400).send('Cannot find enrollment by ID')
            return
        }

        var { course } = req.course;

        if (!course) {
            res.status(400).send("Must provide a new course.")
            return
        }

        course = course.toUpperCase()
        course = course.replace(" ", "")
        var reg = new RegExp("[A-Z0-9]+")
        if (!reg.test(course)) {
            res.status(400).send("Please provide a valid course format without any special symbols.")
            return
        }

        // Add the new course to the enrollment, if they aren't already there
        const index = enr.classList.indexOf(course)
        if (index >= 0) {
            res.status(400).send("Course already exists.");
            return
        }
        const newClassList = enr.classList.concat(course)

        // update the course list
        Enrollment.findByIdAndUpdate(userID, {classList: newClassList}, (err, enr) => {
            if (err) {
                res.status(500).send("Unable to add course.");
                return;
            }

            res.status(201).send("New course added.");
        })
    })
}; 

// TODO: deletes the course from the list of courses the user is taking
const deleteCourseHandler = async (req, res, { Enrollment }) => {
        // extract user from X-User header
        const user = req.header('X-User')
        var userObject = ""
        try {
            userObject = JSON.parse(user)
        } catch (e) {
            res.status(400).send('Cannot parse JSON')
            return
        }
        const userID = userObject.id
        
        if (!userID) {
            res.status(401).send("User is not authenticated.")
            return
        }
        
        // // extract the enrollment
        Enrollment.findByID(userID, (err, enr) => {
            // if there's an error or enrollment could not be found
            if (err || enr === null) {
                res.status(400).send('Cannot find enrollment by ID')
                return
            }
    
            const { course } = req.course;
    
            if (!course) {
                res.status(400).send("Must provide the course to delete.")
                return
            }
    
            // Add the new course to the enrollment, if they aren't already there
            const index = enr.classList.indexOf(course)
            if (index < 0) {
                res.status(400).send("Must provide valid course");
                return
            }

            // delete the course from the class list
            var classList = enr.classList
            classList.splice(index, 1);

            Enrollment.findByIdAndUpdate(userID, {classList: classList}, (err, enr) => {
                if (err) {
                    res.status(500).send('Cannot remove')
                    return
                }

                res.status(200).send('Course removed.')
            })
        })
}

module.exports = { 
    postGroupHandler,
    getGroupHandler,
    getOneGroupHandler,
    patchOneGroupHandler,
    deleteOneGroupHandler,
    postMemberHandler,
    deleteMemberHandler,
    getCourseHandler,
    postCourseHandler,
    deleteCourseHandler }

    