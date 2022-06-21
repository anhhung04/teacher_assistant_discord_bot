const deployCommandsGuild = require('../deploy-commands-guild.js');

module.exports = {
	name: 'guildCreate',
	async execute(guild) {
		deployCommandsGuild(guildId);
	},			
};

