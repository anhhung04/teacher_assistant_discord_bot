const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    guildId: {
        type: String, 
        require: true
    },
    name:String,
    discordId: {
        type: String,
        require: true
    },
    subjects: [String],
    guild:{
        type: mongoose.Types.ObjectId,
        ref: 'Guild'
    }
});

const memberModel = new mongoose.model('Member', memberSchema);

module.exports = memberModel;