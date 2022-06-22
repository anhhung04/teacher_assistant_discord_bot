const { SlashCommandBuilder } = require('@discordjs/builders');
const {MessageActionRow, Modal, TextInputComponent, MessageSelectMenu, Permissions } = require('discord.js');

const data = new SlashCommandBuilder()
.setName('add_student') 
.setDescription('Thêm học sinh');

module.exports = {
	data: data, 
	async execute(interaction){
		if(!interaction.memberPermissions.any(Permissions.FLAGS.ADMINISTRATOR)) return interaction.reply({
			content: 'Bạn không phải admin để thực hiện lệnh này',
			ephemeral: true
		});

		const modal = new Modal()
		.setCustomId('add_student')
		.setTitle('Thêm học sinh');

		const name = new TextInputComponent()
		.setCustomId('name')
		.setLabel("Họ và tên học sinh: ")
		.setStyle('SHORT');
		const idDiscord = new TextInputComponent()
		.setCustomId('idDiscord')
		.setLabel("ID Discord: ")
		.setStyle('SHORT');	
		const subjects = new TextInputComponent()
		.setCustomId('subjects')
		.setLabel("Các chuyên đề tham gia: ")
		.setStyle('SHORT');	

		
		const row = new MessageActionRow().addComponents(name);

		const row2 = new MessageActionRow().addComponents(idDiscord);

		const row3 = new MessageActionRow().addComponents(subjects);

		modal.addComponents(row, row2, row3);

		return interaction.showModal(modal);
	} 
}; 