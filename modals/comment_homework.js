const homeworkModel = require('../models/homework.js');

module.exports = {
    name: 'comment_homework',
    async execute(interaction){
        const embed = interaction.message.embeds.shift();
        const link = interaction.fields.getTextInputValue('link_comment');
        const comment = interaction.fields.getTextInputValue('comment');
        
        var homeworkDB = await homeworkModel.findOne({guildId: interaction.guildId, messageId: interaction.message.id});

        if(homeworkDB.examinerId!=interaction.member.id){
            return interaction.reply({
                content: 'Đã có người nhận chấm bài tập này do đó bạn không được nhận xét',
                ephemeral: true
            });
        }
        
        homeworkDB.comment = comment;
        homeworkDB.linkCorrection = link;

        await homeworkDB.save();
        
        await interaction.reply({
            content: 'Đã thêm nhận xét',
            ephemeral: true
        });

        var title = embed.title.split('#')[0];
        const imageURL = embed.image?.url;
        var filesSend = [];

        embed.setTitle(`(Đã nhận xét) ${title}`);

        if(imageURL){
            embed.setImage(`attachment://${imageURL.split('/').pop()}`);
            filesSend.push(imageURL);
        }else if(interaction.message.attachments.first()){
            filesSend.push(interaction.message.attachments.first());
        }

        return interaction.message.edit({
            embeds: [embed],
            files: filesSend
        });
    }
}