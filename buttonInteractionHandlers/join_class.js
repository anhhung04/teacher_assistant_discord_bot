const classModel = require('../models/class.js');
const memberModel = require('../models/member.js');

module.exports = {
    name: 'join_class',
    async execute(interaction){
        const memberDB = await memberModel.findOne({guildId: interaction.guildId, discordId: interaction.member.id});

        if(!memberDB){
            return interaction.reply({
                ephemeral: true,
                content: 'Bạn không phải học sinh.'
            });
        }

        await classModel.findOneAndUpdate({guildId: interaction.guildId, roomId: interaction.message.id}, {$push:{members: memberDB._id}});

        return interaction.reply({
            ephemeral: true,
            content: 'Đã ghi nhận bạn sẽ tham gia tiết học này.'
        });
    }
}