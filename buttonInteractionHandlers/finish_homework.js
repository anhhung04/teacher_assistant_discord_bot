const homeworkModel = require('../models/homework.js');

module.exports = {
    name:'finish_homework',
    async execute(interaction){
        await interaction.deferReply({ephemeral: true})

        var homeworkDB = await homeworkModel.findOne({guildId: interaction.guildId, messageId: interaction.message.id});
        const embed = interaction.message.embeds.shift();
        
        if(homeworkDB.status==='not_seen'){
            return interaction.editReply({
                content: 'Bài tập này chưa được chấm',
                ephemeral: true
            })
        }

        const examiner = await interaction.guild.members.cache.get(homeworkDB.examinerId);
        
        if(!homeworkDB.comment)
        {
            return interaction.editReply({
                content: 'Bài tập này chưa được nhận xét',
                ephemeral: true
            });
        }

        if(examiner.id!==interaction.member.id){
            return interaction.editReply({
                content: `Bạn không phải người chấm bài tập này (${examiner.displayName})`,
                ephemeral: true
            });
        }

        homeworkDB.status = 'finish';

        await homeworkDB.save();
       
        var title = embed.title.split('#')[0];
        const imageURL = embed.image?.url;
        var filesSend = [];

        embed.setTitle(`${title} #(đã chấm) bởi ${examiner.displayName}`).setColor('GREEN');
        
        if(imageURL){
            embed.setImage(`attachment://${imageURL.split('/').pop()}`);
            filesSend.push(imageURL);
        }else if(interaction.message.attachments.first()){
            filesSend.push(interaction.message.attachments.first());
        }

        await interaction.message.edit({
            embeds: [embed],
            files: filesSend,
            components:[]
        });

        return interaction.editReply({
            content: `Hệ thống ghi nhận bài tập ${homeworkDB.name} do ${homeworkDB.author} nộp đã được chấm`,
            ephemeral: true
        });
    }
}