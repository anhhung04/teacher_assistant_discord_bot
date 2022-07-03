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

        var fileSend = [];

        const imageLink = isImage(fileURL?.url)?fileURL.name:null;

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

        if(fileURL){
            fileSend.push(fileURL);
        }

        const mess = await homeworkChannel.send({
            embeds: [embedSend],
            files: fileSend,
            components: [row]
        });

        const collector = await mess.createMessageComponentCollector({
            filter: (interaction) => ['finish', 'pending', 'comment_button'].includes(interaction.customId)&& interaction.member.roles.highest.name === 'Tutor', 
            componentType: 'BUTTON'   
        });

        await homeworkModel.create({
            guildId: interaction.guildId,
            messageId: mess.id,
            author: interaction.member.displayName,
            authorId: interaction.member.id,
            status: 'not_seen',
            name: name,
            createAt: Date.now(),
            channelSendId: homeworkChannel.id
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

            let homeworkDB = await homeworkModel.findOne({guildId: i.guildId, messageId: i.message.id});

            switch(i.customId){
                case 'finish':{

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

                    homeworkDB.status = 'finish';

                    await homeworkDB.save();

                    await i.reply({
                        content: `Hệ thống ghi nhận bài tập ${homeworkDB.name} do ${homeworkDB.author} nộp đã được chấm`,
                        ephemeral: true
                    });

                    let title = embed.title.split('#')[0];

                    embed.setTitle(`${title} #(đã chấm)`).setColor('GREEN');

                    if(imageLink) embed.setImage(`attachment://${imageLink}`);

                    collector.stop();

                    return i.message.edit({
                        embeds: [embed],
                        components: [],
                        files: fileSend
                    });
                }
                case 'pending':{
                    await homeworkModel.findOneAndUpdate({guildId: i.guildId, messageId: i.message.id}, {examinerId: i.member.id, status: 'pending'});

                    if(homeworkDB.examinerId){
                        if(homeworkDB.examinerId!=i.member.id){
                            return i.reply({
                                content: 'Bài tập này đã có người chấm!',
                                ephemeral: true
                            });
                        }
                    }

                    homeworkDB.examinerId = i.member.id;

                    await homeworkDB.save();

                    await i.reply({
                        content: `Đã ghi nhận ${i.member.user} sẽ chấm bài tập ${homeworkDB.name} do ${homeworkDB.author} nộp.`
                    });

                    let title = embed.title.split('#')[0];
                    embed.setTitle(`${title} #(đang chấm bởi ${i.member.displayName})`).setColor('BLUE');
                    break;        
                }
                case 'comment_button':{
                    return i.showModal(modal);
                }
            }

            if(imageLink) embed.setImage(`attachment://${imageLink}`);

            return i.message.edit({
                embeds: [embed],
                files: fileSend
            });
        });

        return interaction.editReply({
            content: `Đã nộp bài tập thành công.`,
            ephemeral: true
        });
    }
}