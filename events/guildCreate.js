const deployCommandsGuild = require('../deploy-commands-guild.js');
const guildModel = require('../models/')

module.exports = {
	name: 'guildCreate',
	async execute(guild) {
		await deployCommandsGuild(guild.id);
		const guildDB = new guildModel({
			guildId: guild.id,
		});
		return guildDB.save();
	},			
};

