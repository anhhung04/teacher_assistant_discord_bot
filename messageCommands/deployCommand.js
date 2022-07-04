const deployCommandGuild = require('../deploy-commands-guild.js');

module.exports = {
    name: 'deployCommand',
    async execute(mess, args){
        await deployCommandGuild(mess.guildId);
        return mess.reply('Đã triển khai lại lệnh')
    }
}