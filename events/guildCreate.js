const deployCommandsGuild = require('../deploy-commands-guild.js');
const guildModel = require('../models/guild.js')

module.exports = {
	name: 'guildCreate',
	async execute(guild) {
		try{
			await deployCommandsGuild(guild.id);
			const guildDB = new guildModel({
				guildId: guild.id
			});
			return guildDB.save();
		}catch(err){
			console.log(err)
		}
	},			
};

