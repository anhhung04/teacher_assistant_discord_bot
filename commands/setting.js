const { SlashCommandBuilder } = require('@discordjs/builders');
const {Permissions} = require('discord.js');
const guildModel = require('../models/guild.js');

const data = new SlashCommandBuilder()
.setName('setting') 
.setDescription('Cài đặt bot')
.addSubcommand(sub => 
	sub.setName('channels_setting')
	.setDescription('Cài đặt kênh.')
	.addChannelOption(opt => 
		opt.setName('reply_channel')
		.setDescription('Cài đặt kênh trả lời câu hỏi cho học sinh.')
	)
	.addChannelOption(opt =>
		opt.setName('submit_channel')
		.setDescription('Cài đặt kênh nhận và nộp bài tập')
	)
	.addChannelOption(opt =>
		opt.setName('notification_channel')
		.setDescription('Cài đặt kênh thông báo')
	)
);

module.exports = {
	data: data, 
	async execute(interaction) {
		if(!interaction.memberPermissions.any(Permissions.FLAGS.ADMINISTRATOR)) return interaction.reply({
			content: 'Bạn không phải admin để thực hiện lệnh này',
			ephemeral: true
		});

		const guildDB = await guildModel.findOne({guildId: interaction.guildId});

		const replyChannel = interaction.options.getChannel('reply_channel');
		const submitChannel = interaction.options.getChannel('submit_channel');
		const notiChannel = interaction.options.getChannel('notification_channel');

		if(replyChannel){
			guildDB.reply_channel = replyChannel.id;
		}

		if(submitChannel){
			guildDB.submit_channel = submitChannel.id;
		}

		if(notiChannel){
			guildDB.noti_channel = notiChannel.id;
		}

		await guildDB.save();

		return interaction.reply({
			content: `Đã cài đặt thành công`,
			ephemeral: true
		});
	} 
}; 