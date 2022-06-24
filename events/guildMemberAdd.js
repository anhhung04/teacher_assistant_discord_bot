const memberModel = require('../models/member.js');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member){
        const memberDB = await memberModel.findOne({guildId: member.guild.id, discordId: member.id});

        if(memberDB){
            var roles = await member.guild.roles.cache;
            roles = roles.filter(role => memberDB.subjects.includes(role.name));
            
            await member.setNickname(memberDB.name);
            await member.edit({
                roles: roles
            });
            
            return;
        }

        console.log(`Đã kick ${member.displayName}`);

        return member.kick(`Bạn hãy điền form sau để tham lớp học:\nhttps://forms.gle/5hkSsmHQAvBETfKs7`);
    }
}