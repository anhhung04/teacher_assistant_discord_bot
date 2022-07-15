const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    guildId: {
        type: String,
        require: true
    },topic: {
        type: String,
        require: true
    },
    index: {
        type: Number,
        require: true
    },members:[{
        type: mongoose.Types.ObjectId,
        ref: 'Member'
    }],
    teacher: {
        type: String,
        require: true
    }, name:{
        type: String, 
        require: true
    }, roomId:String
});

const classModel = new mongoose.model('Class', classSchema);

module.exports = classModel;