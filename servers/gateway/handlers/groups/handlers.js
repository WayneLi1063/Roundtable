// TODO: Creates a new group with user as creator
const postGroupHandler = async (req, res, { Group }) => {
    // const user = req.header('X-User')
    // var userObject = ""
    // try {
    //     userObject = JSON.parse(user)
    // } catch (e) {
    //     res.status(400).send('Cannot parse JSON')
    //     return
    // }
    // const userID = userObject.id
    // const userEmail = userObject.email
    // const { name, description, private } = req.body;

    // //check if channel name is provided
    // if (name === null | !name) {
    //     res.status(400).send("Must provide channel name");
    // }

    // //check if channel access setting is provided
    // if (private === null) {
    //     res.status(400).send("Must provide channel access setting (private/public)");
    // }

    // //store the id and email of the creator
    // creator = {
    //     userID: userID,
    //     userEmail: userEmail
    // }

    // //log current time as created time
    // const createdAt = new Date();

    // //initialize the edited date as date(0) to be the default date(to indicate that no edit has been done)
    // const editedDate = new Date(0);

    // //construct the channel object
    // const channel = {
    //     name: name,
    //     description: description,
    //     private: private,
    //     members: [userID],
    //     createdAt: createdAt,
    //     creator: creator,
    //     editedAt: editedDate
    // }

    // //send query to database
    // const query = new Channel(channel)
    // query.save((err, newChannel) => {
    //     if (err) {
    //         res.status(500).send('Unable to create channel.');
    //         return;
    //     }

    //     res.set('Content-Type', 'application/json')
    //     res.status(201).json(newChannel);
    // })
}

// TODO: Responds with all groups that fit the filters
const getGroupHandler = async (req, res, { Group }) => {
    // try {
    //     const channels = await Channel.find();
    //     res.set('Content-Type', 'application/json')
    //     res.status(200).json(channels)
    // } catch (e) {
    //     res.status(500).send("unable to get channels")
    // }
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
            const groups = await Group.find();
            res.set('Content-Type', 'application/json')
            res.status(200).json(groups)
        } catch (e) {
            res.status(500).send("unable to get the group")
        }
    })

    // const channelID = req.params.channelID
    // var messageID = null
    // if (req.query !== null) {
    //     messageID = req.query.before
    // }

    // //locate the target channel by id
    // Channel.findById(channelID, async (err, ch) => {
    //     if (err || ch === null) {
    //         res.status(400).send('Cannot find channel')
    //         return
    //     }

    //     //gets the user from header
    //     const user = req.header('X-User')
    //     var userObject = ""
    //     try {
    //         userObject = JSON.parse(user)
    //     } catch (e) {
    //         res.status(400).send('Cannot parse JSON')
    //         return
    //     }
    //     const userID = userObject.id

    //     if (ch.private && !ch.members.includes(userID)) {
    //         res.status(403).send("unauthorized")
    //         return;
    //     }
        
    //     try {
    //         var messages = []

    //         if (messageID != null) {
    //             Message.findById(messageID, (err, msg) => {
    //                 if (msg.channelID != channelID)
    //                 res.status(403).send("unauthorized")
    //                 return
    //             })

    //             messages = await Message.find( {_id: { $lt: messageID}, channelID: channelID} ).limit(100).sort({createdAt:-1})
    //         } else {
    //             messages = await Message.find({channelID: channelID}).sort({createdAt:-1}).limit(100)
    //         }

            
    //         res.set('Content-Type', 'application/json')
    //         res.status(201).json(messages)
    //     } catch (e) {
    //         res.status(500).send("unable to get messages")
    //     }
    // })
}

// TODO: Updates a group's information
const patchOneGroupHandler = async (req, res, { Group }) => {
    // //gets the channelID from the address
    // const channelID = req.params.channelID

    // //locate the target channel by id
    // Channel.findById(channelID, (err, ch) => {
    //     if (err || ch === null) {
    //         res.status(400).send('Cannot find channel')
    //         return
    //     }

    //     //gets the user from header
    //     const user = req.header('X-User')
    //     var userObject = ""
    //     try {
    //         userObject = JSON.parse(user)
    //     } catch (e) {
    //         res.status(400).send('Cannot parse JSON')
    //         return
    //     }
    //     const userID = userObject.id

    //     //see if the user is authorized to post in this channel
    //     if (ch.creator.userID != userID) {
    //         res.status(403).send("unauthorized")
    //         return
    //     }

    //     //get the new name and description from request body
    //     var { name, description } = req.body

    //     //set the name and description to the original if they are null
    //     if (name == null & "") {
    //         name = ch.name
    //     }

    //     if (description == null) {
    //         description = ch.description
    //     }

    //     //construct new channel
    //     newChannel = {
    //         name: name,
    //         description: description,
    //         private: ch.private,
    //         members: ch.members,
    //         createdAt: ch.createdAt,
    //         creator: ch.creator,
    //         editedAt: new Date()
    //     }

    //     //update channel
    //     Channel.findByIdAndUpdate(channelID, newChannel, {new: true}, (err, nch) => {
    //         if (err) {
    //             res.status(500).send('Unable to update channel')
    //             return
    //         }

    //         res.set('Content-Type', 'application/json')
    //         res.status(201).json(nch)
    //     })
    // })
}

// TODO: Deletes a group
const deleteOneGroupHandler = async (req, res, { Group }) => {
    // //gets the channelID from the address
    // const channelID = req.params.channelID

    // //locate the target channel by id
    // Channel.findById(channelID, (err, ch) => {
    //     if (err || ch === null) {
    //         res.status(400).send('Cannot find channel')
    //         return
    //     }

    //     //gets the user from header
    //     const user = req.header('X-User')
    //     var userObject = ""
    //     try {
    //         userObject = JSON.parse(user)
    //     } catch (e) {
    //         res.status(400).send('Cannot parse JSON')
    //         return
    //     }
    //     const userID = userObject.id

    //     //check if user is authorized to delete the channel
    //     if (ch.creator.userID != userID) {
    //         res.status(403).send("unauthorized")
    //         return
    //     }

    //     //finders for channel and messages
    //     const channelFinder = {_id : channelID}
    //     const messageFinder = {channelID : channelID}

    //     //delete the channel
    //     Channel.deleteOne(channelFinder, (err) => {
    //         if (err) {
    //             res.status(500).send('Unable to delete channel')
    //             return
    //         }
    //     })

    //     //delete all messages in the channel
    //     Message.deleteMany(messageFinder, (err) => {
    //         if (err) {
    //             res.status(500).send('Unable to delete messages on target channel')
    //             return
    //         } 
    //         res.send("delete was successful")
    //     })
    // })
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
    //         res.status(400).send("Must provide the new member info");
    //         return
    //     }

    //     // Add the new user (its userID) to the member list, if they aren't already there
    //     const index = ch.members.indexOf(id)
    //     if (index >= 0) {
    //         res.status(400).send("Member already exists.");
    //         return
    //     }
    //     const channelMembers = ch.members.concat(id)

    //     // update the member list
    //     Channel.findByIdAndUpdate(channelID, {members: channelMembers}, (err, c) => {
    //         if (err) {
    //             res.status(500).send("Unable to add the new member.");
    //             return;
    //         }

    //         res.status(201).send("New member added.");
    //     })

    // })
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

// TODO: adds a course to the list of courses the user is taking
const postCourseHandler = async (req, res, { Group }) => {
    // // extract the message ID
    // const messageID = req.params.messageID
    
    // Message.findById(messageID, (err, msg) => {
    //     // if there's an error or message could not be found
    //     if (err || msg === null) {
    //         res.status(400).send('Cannot find message by ID')
    //         return
    //     }

    //     // extract user from X-User header
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

    //     // check if the user editing is the creator of the message
    //     if (userID !== msg.creator.userID) {
    //         res.status(403).send("Users cannot edit messages not of their own.")
    //         return;
    //     }

    //     const { body } = req.body;

    //     if (!body) {
    //         res.status(400).send("Must provide new body.")
    //         return
    //     }

    //     Message.findByIdAndUpdate(messageID, {body: body, editedAt: new Date()}, {new: true}, (err, msg) => {
    //         if (err) {
    //             res.status(500).send('Cannot update')
    //             return
    //         }

    //         res.set('Content-Type', 'application/json')
    
    //         res.status(201).json(msg)
    //     })
    // })
}; 

// TODO: deletes the course from the list of courses the user is taking
const deleteCourseHandler = async (req, res, { Group }) => {
    // const messageID = req.params.messageID

    // Message.findById(messageID, (err, msg) => {
    //     if (err || msg === null) {
    //         res.status(400).send('Cannot find message by ID')
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
    
    //     if (userID !== msg.creator.userID) {
    //         res.status(403).send("Users cannot delete messages not of their own")
    //         return;
    //     }

    //     Message.findByIdAndRemove(messageID, (err) => {
    //         if (err) {
    //             res.status(500).send('Cannot remove')
    //             return
    //         }

    //         res.status(200).send("Message deleted.")
    //     })
    // })
}

module.exports = { 
    postGroupHandler,
    getGroupHandler,
    getOneGroupHandler,
    patchOneGroupHandler,
    deleteOneGroupHandler,
    postMemberHandler,
    deleteMemberHandler,
    postCourseHandler,
    deleteCourseHandler }