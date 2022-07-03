const memberModel = require('../models/member.js');
const guildModel = require('../models/guild.js');

module.exports = {
    name: 'add_student',
    async execute(interaction){
        const name = interaction.fields.getTextInputValue('name');
        const idDiscord = interaction.fields.getTextInputValue('idDiscord');
        const subjects = interaction.fields.getTextInputValue('subjects').split(',').map(e => e.trim().toLowerCase());

        const checkMember = await memberModel.findOne({guildId: interaction.guildId, discordId: idDiscord});

        if(checkMember){
            return interaction.reply({
                content: 'Học sinh này đã được thêm vào hệ thống',
                ephemeral: true
            });
        }
        
        var newMember = new memberModel({
            guildId: interaction.guildId,
            name: name,
            discordId: idDiscord,
            subjects: subjects,
            attendance: new Array(subjects.length).fill(0)
        });
        console.log(newMember);

        newMember = await newMember.save();

        await guildModel.findOneAndUpdate({
            guildId: interaction.guildId
        },{
            $push: {members: newMember._id}
        });

        return interaction.reply({content: 'Câu trả lời đã được ghi nhận, học sinh này có thể vào được máy chủ!', ephemeral: true });
    }
}