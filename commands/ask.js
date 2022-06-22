const { SlashCommandBuilder } = require('@discordjs/builders');
const embed = require('../utilities/embed.js'); //async function

const data = new SlashCommandBuilder()
.setName('ask') 
.setDescription('Đặt câu hỏi')
.addStringOption(option => option.setName('topic').setDescription('Chủ đề của vấn đề bạn muốn hỏi.').setRequired(true))
.addStringOption(option => option.setName('question').setDescription('Nội dung cần hỏi').setRequired(true));

module.exports = {
	data: data, 
	async execute(interaction) {
       const topic = interaction.options.getString('topic');
       const question = interaction.options.getString('question');

       const embedSend = 
       //TODO: finish it
	} 
}; 