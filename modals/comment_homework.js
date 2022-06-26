const homeworkModel = require('../models/homework.js');

module.exports = {
    name: 'comment_homework',
    async execute(interaction){
        const link = interaction.fields.getTextInputValue('link');
        const comment = interaction.fields.getTextInputValue('comment');
        
        const homeworkDB = await homeworkModel.findOne({guildId: interaction.guildId, messageId: interaction.message.id});

        if(homeworkDB.examinerId!==interaction.member.id){
            return interaction.reply({
                content: 'Đã có người nhận chấm bài tập này do đó bạn không được nhận xét',
                ephemeral: true
            });
        }

        homeworkDB.comment = comment;
        homeworkDB.link = link;

        await homeworkDB.save();
        
        await interaction.reply({
            content: 'Đã thêm nhận xét',
            ephemeral: true
        });

        var embed = interaction.message.embeds.shift();
        var title = embed.title;

        embed.setTitle(`(Đã nhận xét) ${title}`);

        return interaction.message.edit({
            embeds: [embed]
        }); 
    }
}