const mongoose = require('mongoose');
const express = require('express');
const { groupSchema, enrollmentSchema } = require('./schemas');
const {
    postGroupHandler,
    getGroupHandler,
    getOneGroupHandler,
    patchOneGroupHandler,
    deleteOneGroupHandler,
    postMemberHandler,
    deleteMemberHandler,
    postCourseHandler,
    deleteCourseHandler
} = require('./handlers')


const mongoEndpoint = `mongodb://${process.env.MONGOADDR}/test`
const port = 80;

const Group = mongoose.model("Group", groupSchema)
const Enrollment = mongoose.model("Enrollment", enrollmentSchema)

const app = express();
app.use(express.json());

const connect = () => {
    mongoose.connect(mongoEndpoint);
}

const RequestWrapper = (handler, SchemeAndDbForwarder) => {
    return (req, res) => {
        handler(req, res, SchemeAndDbForwarder);
    }
}

app.post('/v1/groups', RequestWrapper(postGroupHandler, { Group }))
app.get('/v1/groups', RequestWrapper(getGroupHandler, { Group }))
app.get('/v1/groups/:groupID', RequestWrapper(getOneGroupHandler, { Group }))
app.patch('/v1/groups/:groupID', RequestWrapper(patchOneGroupHandler, { Group }))
app.delete('/v1/groups/:groupID', RequestWrapper(deleteOneGroupHandler, { Group }))
app.post('/v1/groups/:groupID/members', RequestWrapper(postMemberHandler, { Group }));
app.delete('/v1/groups/:groupID/members', RequestWrapper(deleteMemberHandler, { Group }));
app.post('/v1/users/courses', RequestWrapper(postCourseHandler, { Enrollment }));
app.delete('/v1/users/courses', RequestWrapper(deleteCourseHandler, { Enrollment }));

connect();
mongoose.connection.on('error', console.error)
    .on('disconnected', connect)
    .once('open', main);

async function main() {
    app.listen(port, "", () => {
        console.log(`server listing at ${port}`);
    })
}