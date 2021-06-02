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
    getCourseHandler,
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

app.route('/v1/groups')
    .post(RequestWrapper(postGroupHandler, { Group }))
    .get(RequestWrapper(getGroupHandler, { Group }))
    .all((req, res) => {
        res.status(405).send();
    })
app.route('/v1/groups/:groupID')
    .get(RequestWrapper(getOneGroupHandler, { Group }))
    .patch(RequestWrapper(patchOneGroupHandler, { Group }))
    .delete(RequestWrapper(deleteOneGroupHandler, { Group }))
    .all((req, res) => {
        res.status(405).send();
    })
app.route('/v1/groups/:groupID/members')
    .post(RequestWrapper(postMemberHandler, { Group }))
    .delete(RequestWrapper(deleteMemberHandler, { Group }))
    .all((req, res) => {
        res.status(405).send();
    })
app.route('/v1/users/courses')
    .get(RequestWrapper(getCourseHandler, { Enrollment }))
    .post(RequestWrapper(postCourseHandler, { Enrollment }))
    .delete('/v1/users/courses', RequestWrapper(deleteCourseHandler, { Enrollment }))
    .all((req, res) => {
        res.status(405).send();
    })

connect();
mongoose.connection.on('error', console.error)
    .on('disconnected', connect)
    .once('open', main);

async function main() {
    app.listen(port, "", () => {
        console.log(`server listing at ${port}`);
    })
}