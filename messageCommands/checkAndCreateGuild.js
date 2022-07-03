const guildModel = require('../models/guild.js');

module.exports = {
    name: "checkAndCreateGuild",
    async execute(message, args) {
        const guildDB = await guildModel.findOne({guildId: message.guildId});

        if(guildDB){
            return message.reply('Thông tin của server này đã có trong hệ thống');
        }else{
            await guildDB.create({guildId: message.guildId});
            return message.reply('Đã thêm thông in về server này vào hệ thống, vui lòng cài đặt các kênh để sử dụng');
        }
    },
};