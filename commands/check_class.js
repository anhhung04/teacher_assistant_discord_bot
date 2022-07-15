const { SlashCommandBuilder, hyperlink} = require('@discordjs/builders');
const {MessageEmbed} = require('discord.js');
const classModel = require('../models/class.js');

const data = new SlashCommandBuilder()
.setName('check_class') 
.setDescription('Kiểm tra thông tin buổi học')
.addStringOption(opt => opt.setName('thematic').setDescription('Chuyên đề học vào buổi đó.').setRequired(true).addChoices(...['cơ học', 'điện từ học', 'nhiệt học', 'quang học', 'vật lí hiện đại'].map(e => ({name: e, value:e}))))
.addIntegerOption(opt => opt.setName('index').setDescription('Thứ tự buổi dạy').setRequired(true));


module.exports = {
	data: data, 
	async execute(interaction){
        await interaction.deferReply({ephemeral: true});
        const topic = interaction.options.getString('thematic');
        const index = interaction.options.getInteger('index');
        var embeds = [];

        const classDB = await classModel.findOne({guildId: interaction.guildId, topic: topic, index: index}).populate('members')

        if(!classDB){
            return interaction.editReply({
                content: `Không tìm thấy buổi học ${topic}-${index} trong hệ thống.`
            });
        }

        const {members, teacher} = classDB;
       
        const numOfEmbeds = Math.ceil(members.length/25);

        const author = {name: teacher, iconURL: interaction.client.user.displayAvatarURL()}

        if(numOfEmbeds===0){
            embeds.push(new MessageEmbed().setAuthor(author).setColor('BLUE').setTitle('Tiết học này không có ai tham gia.'))
        }

        for(let i=0; i< numOfEmbeds; i++){
            let end = (i<=members.length-25)?i+25:members.length;
            let membersArr = members.slice(i,end);
            let timeInRoomArr = timeInRoom.slice(i, end);
            let fields = [];

            for(let k=0; k< membersArr.length; k++){
                fields.push({
                    name: membersArr[k].name,
                    value: '\u200B',
                    inline: true
                })
            }

            embeds.push(new MessageEmbed().setColor('BLUE').setAuthor(author).setFields(fields).setTimestamp().setTitle('Các thành viên tham gia buổi học: '));
            
            if(i>=members.length) break;
        }
        
        return interaction.editReply({
            embeds: embeds
        });
	} 
}; 