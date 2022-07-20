const classModel = require('../models/class.js');
const memberModel = require('../models/member.js');

module.exports = {
    name: 'join_class',
    async execute(interaction){
        var memberDB = await memberModel.findOne({guildId: interaction.guildId, discordId: interaction.member.id});

        if(!memberDB){
            return interaction.reply({
                ephemeral: true,
                content: 'Bạn không phải học sinh.'
            });
        }

        var classDB = await classModel.findOne({guildId: interaction.guildId, roomId: interaction.message.id});

        if(classDB.members&&!classDB.members?.includes(memberDB._id)){
            classDB.members.push(memberDB._id);
        }else{
            classDB.members = [memberDB._id]
        }

        
        const index = memberDB.subjects.indexOf(classDB.topic);

        if(index===-1){
            return interaction.reply({
                ephemeral: true,
                content: 'Bạn không đăng ký tham gia chuyên đề này'
            });
        }

        memberDB.attendance[index]++;

        await classDB.save();
        await memberDB.save();

        return interaction.reply({
            ephemeral: true,
            content: 'Đã ghi nhận bạn sẽ tham gia tiết học này.'
        });
    }
}