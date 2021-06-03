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
        return;
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
        teamName: teamName,
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

    //locate the target group by id
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
        if (foundGroup.creator.userID != userID) {
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
            return;
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
            teamName: teamName,
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

    //locate the target group by id
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
        if (foundGroup.creator.userID != userID) {
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
        
        if (grp.members.length === grp.maxSize) {
            res.status(400).send("Group already full")
            return;
        }

        const { id } = req.body;

        const index = grp.members.indexOf(id)
        if (index >= 0) {
            res.status(400).send("Member already exists.");
            return
        }

        //add the user from group
        const groupMembers = grp.members.concat(id)
        
        Group.findByIdAndUpdate(groupID, {members: groupMembers}, (err, c) => {
            if (err) {
                res.status(500).send("Unable to join.");
                return;
            }

            res.status(201).send("joined successfully.");
        })
    })
}

// TODO: deletes the member from the group if user is creator or the user themselves
const deleteMemberHandler = async (req, res, { Group }) => {
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
        
        if (userID === grp.creator.userID) {
            res.status(403).send("user is the creator")
            return;
        }

        const index = grp.members.indexOf(userID)

        if (index < 0) {
            res.status(400).send("User is not part of the group");
            return
        }

        //removes the user from group
        var groupMembers = grp.members
        groupMembers.splice(index, 1)

        Group.findByIdAndUpdate(groupID, {members: groupMembers}, (err, c) => {
            if (err) {
                res.status(500).send("Unable to leave.");
                return;
            }

            res.status(201).send("left group successfully.");
        })
    })
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

    Enrollment.findOne({userID: userID}, (err, enr) => {
        // if there's an error or enrollment could not be found
        if (err) {
            res.status(500).send('Unexpected error.')
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
    Enrollment.findOne({userID: userID}, (err, enr) => {
        // if there's an error or enrollment could not be found
        if (err) {
            res.status(500).send('Unexpected error.')
            return
        }

        var { course } = req.body;

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
        if (enr && enr.classList) {
            const index = enr.classList.indexOf(course)
            if (index >= 0) {
                res.status(400).send("Course already exists.");
                return
            }
            const newClassList = enr.classList.concat(course)

            // update the course list
            Enrollment.findOneAndUpdate({userID: userID}, {classList: newClassList}, {new: true}, (err, enr) => {
                if (err) {
                    res.status(500).send("Unable to add course.");
                    return;
                }

                res.status(201).send(enr);
            })
        } else {
            const newClassList = [course]

            const enroll = new Enrollment({userID: userID, classList: newClassList})

            enroll.save((err, enr) => {
                if (err) {
                    res.status(500).send("Unable to add course.");
                    return;
                }

                res.status(201).send(enr);
            })
        }


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
        
        // extract the enrollment
        Enrollment.findOne({userID: userID}, (err, enr) => {
            // if there's an error or enrollment could not be found
            if (err || enr === null) {
                res.status(400).send('Cannot find enrollment by ID')
                return
            }
    
            const { course } = req.body;
    
            if (!course) {
                res.status(400).send("Must provide the course to delete.")
                return
            }
    
            var index = -1
            // Add the new course to the enrollment, if they aren't already there
            if (enr.classList !== null) {
                index = enr.classList.indexOf(course)
                if (index < 0) {
                    res.status(400).send("Must provide valid course");
                    return
                }
            } else {
                res.status(400).send("Nothing to delete.");
                return
            }

            var newClassList = enr.classList
            // delete the course from the class list
            newClassList.splice(index, 1);

            Enrollment.findOneAndUpdate({userID: userID}, {classList: newClassList}, {new: true}, (err, enr) => {
                if (err) {
                    res.status(500).send('Cannot remove')
                    return
                }

                res.status(200).send(enr)
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

    