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

function isPDF(url){
    return /\.(pdf)$/.test(url);
}

module.exports = {
    data: data,
    async execute(interaction){
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
            filter: (interaction) => interaction.customId === 'finish' && interaction.member.roles.highest.name === 'Tutor', 
            componentType: 'BUTTON'   
        });

        collector.on('collect', i =>{
            let embed = i.message.embeds.shift();
            let title = embed.title;
            embed.setTitle(`${title} (đã chấm)`).setColor('GREEN');
            collector.stop();
            return i.message.edit({
                embeds: [embed],
                components: []
            });
        });

        const homeworkDB = new homeworkModel({
            guildId: interaction.guildId,
            messageId: mess.id,
            author: interaction.member.displayName,
            authorId: interaction.member.id
        });

        await homeworkDB.save();

        return interaction.reply({
            content: `Đã nộp bài tập thành công.`,
            ephemeral: true
        });
    }
}