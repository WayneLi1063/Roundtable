const Schema = require("mongoose").Schema;

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

module.exports = { groupSchema, enrollmentSchema }