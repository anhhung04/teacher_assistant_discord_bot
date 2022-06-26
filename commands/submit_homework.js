const { SlashCommandBuilder} = require('@discordjs/builders');
const {MessageActionRow, MessageButton, Modal, TextInputComponent} = require('discord.js');
const guildModel = require('../models/guild.js');
const embed = require('../utilities/embed.js');
const homeworkModel = require('../models/homework.js');

const data = new SlashCommandBuilder()
    .setName('submit_homework')
    .setDescription('Nộp bài tập')
    .addStringOption(opt => opt.setName('name').setDescription('Tên bài tập cần nộp').setRequired(true))
    .addAttachmentOption(opt => opt.setName('file').setDescription('File bài tập').setRequired(true));
    

function isImage(url) {
  return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url);
}

function isPDF(url){
    return /\.(pdf)$/.test(url);
}

module.exports = {
    data: data,
    async execute(interaction){

        await interaction.deferReply({ephemeral: true});
        const guildDB = await guildModel.findOne({guildId: interaction.guildId});
        const checkHomeworkChannel = await interaction.guild.channels.fetch(guildDB.homework_channel)
        const homeworkChannel = checkHomeworkChannel||interaction.channel;

        const fileURL = interaction.options.getAttachment('file');
        const name = interaction.options.getString('name');

        const imageLink = isImage(fileURL)?fileURL:null;

        const embedSend = await embed('RED', name, null, null, null, imageLink, {name: interaction.member.displayName, iconURL: interaction.member.displayAvatarURL()});

        const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setCustomId('pending')
            .setLabel('Đang chấm')
            .setStyle('PRIMARY'),
            new MessageButton()
            .setCustomId('comment_button')
            .setLabel('Nhận xét')
            .setStyle('DANGER'),
            new MessageButton()
            .setCustomId('finish')
            .setLabel('Đã chấm')
            .setStyle('SUCCESS')
        );

        const mess = await homeworkChannel.send({
            embeds: [embedSend],
            files: [fileURL],
            components: [row]
        });

        const collector = await mess.createMessageComponentCollector({
            filter: (interaction) => ['finish', 'pending', 'comment_button'].includes(interaction.customId)&& interaction.member.roles.highest.name === 'Tutor', 
            componentType: 'BUTTON'   
        });

        collector.on('collect', async i =>{
            let embed = i.message.embeds.shift();
            let modal = new Modal()
            .setCustomId('comment_homework')
            .setTitle('Nhận xét bài tập')
            .addComponents(
                new MessageActionRow()
                .addComponents(
                    new TextInputComponent()
                    .setCustomId('link')
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

            switch(i.customId){
                case 'finish':{
                    let homeworkDB = await homeworkModel.findOne({guildId: i.guildId, messageId: i.message.id});

                    if(!homeworkDB.comment)
                    {
                        return i.reply({
                            content: 'Bài tập này chưa được nhận xét',
                            ephemeral: true
                        });
                    }

                    if(homeworkDB.examinerId!==i.member.id){
                        return i.reply({
                            content: 'Bạn không phải người chấm bài này',
                            ephemeral: true
                        });
                    }

                    await i.reply({
                        content: 'Hệ thống đã nhận bài sửa',
                        ephemeral: true
                    });

                    let title = embed.title.split('#')[0];
                    embed.setTitle(`${title} #(đã chấm)`).setColor('GREEN');

                    collector.stop();

                    return i.message.edit({
                        embeds: [embed],
                        components: []
                    });
                }
                case 'pending':{
                    await homeworkModel.findOneAndUpdate({guildId: i.guildId, messageId: i.message.id}, {examinerId: i.member.id});

                    await i.reply({
                        content: `Đã ghi nhận ${i.member.user} sẽ chấm bài tập này`
                    });

                    let title = embed.title.split('#')[0];
                    embed.setTitle(`${title} #(đang chấm bởi ${i.member.displayName})`).setColor('BLUE');
                    break;        
                }
                case 'comment_button':{
                    return i.showModal(modal);
                }
            }

            return i.message.edit({
                embeds: [embed],
            });
        });

        await homeworkModel.create({
            guildId: interaction.guildId,
            messageId: mess.id,
            author: interaction.member.displayName,
            authorId: interaction.member.id
        });

        return interaction.editReply({
            content: `Đã nộp bài tập thành công.`,
            ephemeral: true
        });
    }
}