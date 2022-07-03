const cooldowns = new Map();
const homeworkModel = require('../models/homework.js');  
const {MessageActionRow, Modal, TextInputComponent} = require('discord.js');

module.exports = {
	name: 'interactionCreate',
	async execute(interaction) {

        if(interaction.isModalSubmit()){
           let modalId = interaction.customId;
           let modal = interaction.client.modals.get(modalId);

           if(!modal) return;

           try{
                modal.execute(interaction);
           }catch(err){
                console.error(error);
                await interaction.reply({ content: 'Đã có lỗi xảy ra!', ephemeral: true });
           }
        }

        // if(interaction.isButton()&&['pending', 'finish', 'comment_button'].includes(interaction.customId)){
        //     let embed = interaction.message.embeds.shift();
        //     let modal = new Modal()
        //     .setCustomId('comment_homework')
        //     .setTitle('Nhận xét bài tập')
        //     .addComponents(
        //         new MessageActionRow()
        //         .addComponents(
        //             new TextInputComponent()
        //             .setCustomId('link_comment')
        //             .setLabel('Link bài sửa: ')
        //             .setStyle('SHORT')
        //         ), new MessageActionRow()
        //         .addComponents(
        //             new TextInputComponent()
        //             .setCustomId('comment')
        //             .setLabel('Nhận xét bài làm')
        //             .setStyle('PARAGRAPH')           
        //         )   
        //     );
        //     let imageLink = interaction.message?.embeds[0]?.image?interaction.message.embeds[0].image.url.split('/').pop():null;
        //     let fileSend = imageLink?[interaction.message.embeds[0].image.url]:[interaction.message.attachments?.cache.first().url];

        //     switch(interaction.customId){
        //         case 'finish':{
        //             let homeworkDB = await homeworkModel.findOne({guildId: interaction.guildId, messageId: interaction.message.id});

        //             if(!homeworkDB.comment)
        //             {
        //                 return interaction.reply({
        //                     content: 'Bài tập này chưa được nhận xét',
        //                     ephemeral: true
        //                 });
        //             }

        //             if(homeworkDB.examinerId!==interaction.member.id){
        //                 return interaction.reply({
        //                     content: 'Bạn không phải người chấm bài này',
        //                     ephemeral: true
        //                 });
        //             }

        //             homeworkDB.status = 'finish';

        //             await homeworkDB.save();

        //             await interaction.reply({
        //                 content: `Hệ thống ghi nhận bài tập ${homeworkDB.name} do ${homeworkDB.author} nộp đã được chấm`,
        //                 ephemeral: true
        //             });

        //             let title = embed.title.split('#')[0];

        //             embed.setTitle(`${title} #(đã chấm)`).setColor('GREEN');

        //             if(imageLink) embed.setImage(`attachment://${imageLink}`);

        //             return interaction.message.edit({
        //                 embeds: [embed],
        //                 components: [],
        //                 files: fileSend
        //             });
        //         }
        //         case 'pending':{
        //             await homeworkModel.findOneAndUpdate({guildId: interaction.guildId, messageId: interaction.message.id}, {examinerId: interaction.member.id, status: 'pending'});

        //             await interaction.reply({
        //                 content: `Đã ghi nhận ${interaction.member.user} sẽ chấm bài tập ${homeworkDB.name} do ${homeworkDB.author} nộp`
        //             });

        //             let title = embed.title.split('#')[0];
        //             embed.setTitle(`${title} #(đang chấm bởi ${interaction.member.displayName})`).setColor('BLUE');
        //             break;        
        //         }
        //         case 'comment_button':{
        //             return interaction.showModal(modal);
        //         }
        //     }

        //     if(imageLink) embed.setImage(`attachment://${imageLink}`);

        //     return interaction.message.edit({
        //         embeds: [embed],
        //         files: fileSend
        //     });
        // }
        
		if (!interaction.isCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) return;

        if (!cooldowns.has(interaction.commandName)) {
            cooldowns.set(interaction.commandName, new Map());
        }
        
        const now = Date.now();
        const timestamps = cooldowns.get(interaction.commandName);
        const cooldownAmount = (3) * 1000;
        
        if (timestamps.has(interaction.member.id)) {
            const expirationTime = timestamps.get(interaction.member.id) + cooldownAmount;
        
            if (now < expirationTime) {
                // If user is in cooldown
                const timeLeft = (expirationTime - now) / 1000;
                return interaction.reply({content: `Hãy chờ ${timeLeft.toFixed(1)} giây trước khi sử dụng lệnh \`${interaction.commandName}\`.`, ephemeral: true});
            }
        } else {
            timestamps.set(interaction.member.id, now);
            setTimeout(() => timestamps.delete(interaction.member.id), cooldownAmount);
            // Execute command
            try {
                return command.execute(interaction);
            } catch (error) {
                console.error(error);
                interaction.reply({ content: 'Đã có lỗi xảy ra!', ephemeral: true });
            }
        }
        
        return;
	},
};