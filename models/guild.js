const mongoose = require('mongoose');

const guildSchema = new mongoose.Schema({
    guildId: {
        type: String, 
        require: true
    },
    members:[{
        type: mongoose.Types.ObjectId,
        ref: 'Member'
    }],
    reply_channel: String,
    submit_channel: String,
    noti_channel: String
});

const guildModel = new mongoose.model('Guild', guildSchema);

module.exports = guildModel;