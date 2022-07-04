const { SlashCommandBuilder} = require('@discordjs/builders');
const {MessageActionRow, MessageButton} = require('discord.js');
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

module.exports = {
    data: data,
    async execute(interaction){
        await interaction.deferReply({ephemeral: true});
        const guildDB = await guildModel.findOne({guildId: interaction.guildId});
        const checkHomeworkChannel = await interaction.guild.channels.cache.get(guildDB?.homework_channel);
        const homeworkChannel = checkHomeworkChannel||interaction.channel;

        const fileURL = interaction.options.getAttachment('file');
        const name = interaction.options.getString('name');

        var fileSend = [];

        const imageLink = isImage(fileURL?.url)?fileURL.name:null;

        const embedSend = await embed('RED', name, null, null, null, imageLink, {name: interaction.member.displayName, iconURL: interaction.member.displayAvatarURL()});

        const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setCustomId('pending_homework')
            .setLabel('Đang chấm')
            .setStyle('PRIMARY'),
            new MessageButton()
            .setCustomId('comment_button_homework')
            .setLabel('Nhận xét')
            .setStyle('DANGER'),
            new MessageButton()
            .setCustomId('finish_homework')
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
        
        return interaction.editReply({
            content: `Đã nộp bài tập thành công.`,
            ephemeral: true
        });
    }
}