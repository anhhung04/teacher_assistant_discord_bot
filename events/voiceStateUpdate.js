const classModel = require('../models/class.js')

module.exports = {
    name: 'voiceStateUpdate',
    async execute(oldState, newState){
        const checkTutorRole = await oldState.member.roles.cache.find(r => r.name ==='Tutor');
        const [topic, index] = oldState?.channel?oldState.channel.name.split('-'):['nothing',-1];
        const classDB = await classModel.findOne({guildId: oldState.guild.id, topic: topic, index: index, teacher: oldState.member?.displayName, roomId: oldState.channel?.id});

        if(checkTutorRole&&classDB) {
            return oldState.channel.delete();
        }
    }
}