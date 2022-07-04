const homeworkModel = require('../models/homework.js');

module.exports = {
    name: 'pending_homework',
    async execute(interaction){
        const embed = interaction.message.embeds.shift();
        var homeworkDB = await homeworkModel.findOne({guildId: interaction.guildId, messageId: interaction.message.id});
        const examiner = await interaction.guild.members.cache.get(homeworkDB?.examinerId);

        if(!examiner){
            
            homeworkDB.status = 'pending';

            homeworkDB.examinerId = interaction.member.id;

        }else if(examiner.id!==interaction.member.id||homeworkDB?.status==='pending'){
            return interaction.reply({
                content: `Bài tập này đã được chấm bởi ${interaction.member.displayName}.`,
                ephemeral: true
            });
        }

        await homeworkDB.save();

        await interaction.reply({
            content: `Đã ghi nhận ${interaction.member.user} sẽ chấm bài tập ${homeworkDB.name} do ${homeworkDB.author} nộp.`
        });

        var title = embed.title.split('#')[0];
        const imageURL = embed.image?.url;
        var filesSend = [];

        embed.setTitle(`${title} #(đang chấm bởi ${interaction.member.displayName})`).setColor('BLUE');
        
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