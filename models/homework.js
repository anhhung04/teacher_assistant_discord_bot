const mongoose = require('mongoose');

const homeworkSchema = new mongoose.Schema({
    guildId: {
        type: String,
        require: true
    },
    messageId: {
        type: String,
        require: true
    },
    author: {
        type: String
    },
    authorId: {
        type: String,
        require: true
    },
    comment:String,
    examinerId: String,
    linkCorrection: String
});

const homeworkModel = new mongoose.model('Homework', homeworkSchema);

module.exports = homeworkModel;