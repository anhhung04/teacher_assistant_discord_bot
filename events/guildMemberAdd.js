const memberModel = require('../models/member.js');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member){
        const memberDB = await memberModel.findOne({guildId: member.guild.id, discordId: member.id});

        if(memberDB){
            await member.setNickname(memberDB.name);
            return;
        }

        console.log(`Đã kick ${member.displayName}`);

        return member.kick(`Bạn hãy điền form sau để tham lớp học:\nhttps://forms.gle/5hkSsmHQAvBETfKs7`);
    }
}