const { SlashCommandBuilder } = require('@discordjs/builders');

const data = new SlashCommandBuilder()
.setName('setting') 
.setDescription('Cài đặt bot');

module.exports = {
	data: data, 
	async execute(interaction) {
		if(!interaction.memberPermissions.any(Permissions.FLAGS.ADMINISTRATOR)) return interaction.reply({
			content: 'Bạn không phải admin để thực hiện lệnh này',
			ephemeral: true
		});
	} 
}; 