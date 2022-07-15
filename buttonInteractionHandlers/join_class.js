const classModel = require('../models/class.jd');
const memberModel = require('../models/member.js');

module.exports = {
    name: 'join_class',
    async execute(interaction){
        const memberDB = await memberModel.findOne({guildId: interaction.guildId, discordId: interaction.member.id});
        await classModel.findOneAndUpdate({guildId: interaction.guildId, roomId: interaction.message.id}, {$push:{members: memberDB._id}});

        return interaction.reply({
            ephemeral: true,
            content: 'Đã ghi nhận bạn sẽ tham gia tiết học này.'
        });
    }
}