const { SlashCommandBuilder } = require('@discordjs/builders');

const data = new SlashCommandBuilder()
.setName('setting') 
.setDescription('Cài đặt bot');

module.exports = {
	data: data, 
	async execute(interaction) {
       return;
	} 
}; 