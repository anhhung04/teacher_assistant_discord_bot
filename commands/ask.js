const { SlashCommandBuilder } = require('@discordjs/builders');
const embed = require('../utilities/embed.js'); //async function
const guildModel = require('../models/guild.js');

const data = new SlashCommandBuilder()
.setName('ask') 
.setDescription('Đặt câu hỏi')
.addStringOption(option => option.setName('topic').setDescription('Chủ đề của vấn đề bạn muốn hỏi.').setRequired(true))
.addStringOption(option => option.setName('question').setDescription('Nội dung cần hỏi').setRequired(true));

module.exports = {
	data: data, 
	async execute(interaction) {
        const guildDB = await guildModel.findOne({guildId: interaction.guildId});
        const topic = interaction.options.getString('topic');
        const question = interaction.options.getString('question');
        
        if(!guildDB.reply_channel) return interaction.reply({
               content: 'Chưa cài đặt kênh trả lời câu hỏi, vui lòng liên hệ admin',
               ephemeral: true
        });

        const replyChannel = await interaction.guild.channels.fetch(guildDB.reply_channel||'988998582508064859');
        const author = {
            name: interaction.member.displayName,
            iconURL: interaction.member.displayAvatarURL()
        };

        const askMess = await replyChannel.send({
            embeds: [await embed('BLUE', topic, null, [{name: question, value: '\u200B'}], null, null, author)]
        });

        await askMess.startThread({
            name: 'Trả lời',
            autoArchiveDuration: 10080
        });

        return interaction.reply({
            content: 'Đã gửi câu trả lời',
            ephemeral: true
        });
    }      
}