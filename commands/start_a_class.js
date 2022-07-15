const { SlashCommandBuilder, hyperlink} = require('@discordjs/builders');
const {Permissions, MessageEmbed} = require('discord.js');//async function
const guildModel = require('../models/guild.js');
const classModel = require('../models/class.js');

const data = new SlashCommandBuilder()
.setName('start_a_class') 
.setDescription('Bắt đầu 1 buổi học')
.addStringOption(opt => opt.setName('thematic').setDescription('Chuyên đề sẽ dạy').setRequired(true).addChoices(...['cơ học', 'điện từ học', 'nhiệt học', 'quang học', 'vật lí hiện đại'].map(e => ({name: e, value:e}))))
.addStringOption(opt => opt.setName('name').setDescription('Tên của bài học sẽ dạy').setRequired(true))
.addIntegerOption(opt => opt.setName('index').setDescription('Thứ tự buổi dạy').setRequired(true))
.addIntegerOption(opt => opt.setName('link').setDescription('Đường dẫn tham gia lớp học.').setRequired(true));

module.exports ={
    data: data,
    async execute(interaction){
        if(!interaction.memberPermissions.any(Permissions.FLAGS.ADMINISTRATOR)) return interaction.reply({
			content: 'Bạn không phải admin để thực hiện lệnh này',
			ephemeral: true
		});

        await interaction.deferReply({ephemeral: true});

        const guildDB = await guildModel.findOne({guildId: interaction.guildId});
        const topic = await interaction.options.getString('thematic');
        const topicRole = await interaction.guild.roles.cache.find(role => role.name===topic);
        const index = await interaction.options.getInteger('index'); 
        const name = await interaction.options.getString('name');
        const link = await interaction.options.getString('link');

        if(!topicRole) return interaction.editReply({
            content: 'Nhập sai định dạng chuyên đề, hãy sử dụng lại lệnh.',
            ephemeral: true
        });

        if(!guildDB.noti_channel)return interaction.editReply({
            content: 'Chưa có kênh thông báo, vui lòng báo cho admin',
            ephemeral: true
        });

        const notiChannel = await interaction.guild.channels.fetch(guildDB.noti_channel);
       
        const embedSend = new MessageEmbed()
        .setTimestamp()
        .setColor('BLUE')
        .setAuthor({name: interaction.member.displayName, iconURL: interaction.member.displayAvatarURL()})
        .setTitle(`Lớp học chuyên đề ${topic} đã bắt đầu`)
        .addField(`${interaction.member.displayName} phụ trách:\n${name}`, hyperlink('Bấm để tham gia', link));
       
        let role = await interaction.guild.roles.cache.find(r => r.name === topic);
        
        const messNoti = await notiChannel.send({
            content: `${role}`,
            embeds: [embedSend],
            components:[
                {
                    type: 'ACTION_ROW',
                    components:[
                        {
                            type: 'BUTTON',
                            customId: 'join_class',
                            label: 'Điểm danh',
                            style: 'PRIMARY'
                        }
                    ]
                }
            ]
        });

        await classModel.create({
            guildId: interaction.guildId,
            topic: topic,
            index: index,
            teacher: interaction.member.displayName,
            roomId: messNoti.id
        });


        return interaction.editReply({
            content: 'Đã khởi tạo lớp học',
            ephemeral: true
        });
    }
}