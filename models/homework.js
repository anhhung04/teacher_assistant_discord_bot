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
    }
});

const homeworkModel = new mongoose.Schema('Homework', homeworkSchema);

module.exports = homeworkModel;