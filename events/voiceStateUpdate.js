const classModel = require('../models/class.js');
const memberModel = require('../models/member.js');
const {startVoiceTimer, resumeWatch, getTime, stopWatch} = require('../utilities/voiceTimer.js');

module.exports = {
    name: 'voiceStateUpdate',
    async execute(oldState, newState){
        const guildId = oldState.guild.id;
        const userId = newState.member.id;
        const checkTutorRole = await oldState.member.roles.cache.find(r => r.name ==='Tutor');
        const classDB = await classModel.findOne({guildId: guildId, roomId: oldState.channel?.id}).populate('members');
        const newClassDB = await classModel.findOne({guildId: guildId, roomId: newState.channel?.id});

        if(classDB){
            stopWatch(oldState.member.id);
        }

        if(oldState.channel.members.size===0&&classDB) {
            let {topic} = classDB;
            let oldClassMembers = classDB.members;
            
            for(let i=0; i< oldClassMembers.length; i++){
                let memberDB = await memberModel.findOne({_id: oldClassMembers[i]._id});
                let indexOfSub = memberDB.subjects.indexOf(topic);
                if(getTime(oldState.member.id)>150*60*1000){
                    memberDB.attendance[indexOfSub]++;
                }
                resetTime(oldState.member.id);
                await memberDB.save();
            }

            return oldState.channel.delete();
        }

        if(newClassDB&&!checkTutorRole){
            if(getTime(userId)>0){
                resumeWatch(userId);
            }else{
                startVoiceTimer(userId);
                const memberDB = await memberModel.findOne({guildId: newState.guild.id, discordId: userId});
                return newClassDB.members.push(memberDB._id);
            }
        }
        
    }
}
