const homeworkModel = require('../models/homework.js');
const {Modal, TextInputComponent, MessageActionRow} = require('discord.js');

module.exports = {
    name: 'comment_button_homework',
    async execute(interaction){
            const homeworkDB = await homeworkModel.findOne({guildId: interaction.guildId, messageId: interaction.message.id});
            const examiner = await interaction.guild.members.cache.get(homeworkDB?.examinerId)

            if(homeworkDB.status==='pending'&&examiner.id!=interaction.member.id){
                return interaction.reply({
                    content: `Bài tập này đã được ${examiner.displayName} chấm`,
                    ephemeral: true
                });
            }else if(homeworkDB.status==='not_seen'){
                return interaction.reply({
                    content: 'Bạn vui lòng nhận chấm bài tập này trước.',
                    ephemeral: true
                });
            }

            const modal = new Modal()
            .setCustomId('comment_homework')
            .setTitle('Nhận xét bài tập')
            .addComponents(
                new MessageActionRow()
                .addComponents(
                    new TextInputComponent()
                    .setCustomId('link_comment')
                    .setLabel('Link bài sửa: ')
                    .setStyle('SHORT')
                ), new MessageActionRow()
                .addComponents(
                    new TextInputComponent()
                    .setCustomId('comment')
                    .setLabel('Nhận xét bài làm')
                    .setStyle('PARAGRAPH')           
                )   
            );
        return interaction.showModal(modal);
    }
}