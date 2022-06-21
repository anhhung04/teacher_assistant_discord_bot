const { SlashCommandBuilder } = require('@discordjs/builders');

const data = new SlashCommandBuilder()
.setName('roles') 
.setDescription('Setting channel');

module.exports = {
	data: data, 
	async execute(interaction) {
       return;
	} 
}; 