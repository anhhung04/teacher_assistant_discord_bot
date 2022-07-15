const { SlashCommandBuilder, hyperlink} = require('@discordjs/builders');
const {MessageActionRow, Permissions, MessageEmbed, MessageSelectMenu } = require('discord.js');
const { __await } = require('tslib');
const homeworkModel = require('../models/homework.js');
const memberModel = require('../models/member.js');

const data = new SlashCommandBuilder()
.setName('check_student') 
.setDescription('Kiểm tra thông tin học sinh')
.addUserOption(opt => opt.setName('student').setDescription('Học sinh').setRequired(true));

const statusObj = {
    'pending' : 'Đang chấm',
    'finish': 'Đã chấm xong',
    'not_seen' : 'Chưa chấm'
}

const colorEmbed = {
    'pending' : 'BLUE',
    'finish': 'GREEN',
    'not_seen' : 'RED'
}

module.exports = {
	data: data, 
	async execute(interaction){
		if(!interaction.memberPermissions.any(Permissions.FLAGS.ADMINISTRATOR)) return interaction.reply({
			content: 'Bạn không phải admin để thực hiện lệnh này',
			ephemeral: true
		});
        var components = [];

        await interaction.deferReply({ephemeral: true});

        const studentUser = interaction.options.getUser('student');
        const student = await interaction.guild.members.cache.get(studentUser.id);
        const studentDB = await memberModel.findOne({guildId: interaction.guildId, discordId: student.id});

        if(!studentDB){
            return interaction.editReply({
                content: 'Chưa thêm học sinh này vào lớp'
            });
        }

        const homeworks = await homeworkModel.find({guildId: interaction.guildId, authorId: interaction.member.id}).sort({createAt: -1}).limit(10);

        const options = homeworks.map(h => ({label: h.name, value: h.messageId, description: statusObj[h.status]}))

        if(options&&options.length>0){
            let menu = new MessageSelectMenu()
            .setCustomId('student_homework')
            .setPlaceholder('(<=10) Bài tập gần nhất học sinh này đã nộp');
            
            menu.addOptions(options).setMinValues(1);
            let row = new MessageActionRow()
            .addComponents(
                menu
            )
            components.push(row);
        }
        

        const embed = new MessageEmbed()
        .setAuthor({name: student.displayName, iconURL: student.displayAvatarURL()})
        .setColor('BLUE')
        .setTimestamp()
        .setTitle('Các chuyên đề đăng ký: ')
        .setFields(studentDB.subjects.map((s,i) => ({name: s, value: studentDB.attendance[i].toString()})));

        const mess = await interaction.editReply({
            embeds: [embed],
            components: components
        });

        const collector = await mess.createMessageComponentCollector({componentType: 'SELECT_MENU'});

        collector.on('collect',async (i) => {
            await i.deferReply({ephemeral: true});
            await collector.stop();

            const values = i.values;
            const homeworkSend = homeworks.filter(h => values.includes(h.messageId));
            var embeds = [];

            for(let j = 0; j< homeworkSend.length; j++){
                let author;
                let homework = homeworkSend[j];
                let examiner = await i.guild.members.cache.get(homework.examinerId);
                let channelSend = await i.guild.channels.fetch(homework.channelSendId);
                let messIn = await channelSend.messages.fetch(homework.messageId);
                let attachURL;

                if(!channelSend||!messIn){
                    embeds.push(new MessageEmbed().setColor('RED').setTimestamp().setTitle(`Bài tập ${homework.name} đã bị xóa khỏi Discord.`));
                    continue;
                }

                if(messIn.embeds&&messIn.embeds[0]?.image?.url){
                    attachURL = messIn.embeds[0].image.url;
                }else{
                    attachURL = messIn.attachments.first().url;
                }
               
                let fieldsIn = [
                    {
                        name: 'Trạng thái: ',
                        value: statusObj[homework.status], 
                        inline: true
                    },
                    {
                        name: 'Link bài đã nộp: ',
                        value: hyperlink('Bấm vào đây để mở', attachURL),
                        inline: true
                    }
                ]

                if(homework.linkCorrection){
                    fieldsIn.push({
                        name: 'Link bài sửa: ',
                        value: hyperlink('Bấm vào đây để mở', homework.linkCorrection),
                        inline: true
                    })
                }
             

                if(examiner){
                    author = {
                        name: examiner.displayName,
                        iconURL: examiner.displayAvatarURL()
                    }
                }

                let embed  = new MessageEmbed().setColor(colorEmbed[homework.status]).addFields(fieldsIn).setTitle(homework.name).setTimestamp();

                if(author){
                    embed.setAuthor(author);
                }

                if(homework.comment){
                    embed.setDescription(homework.comment);
                }

                embeds.push(embed);
            }

            return i.editReply({
                embeds: embeds,
                ephemeral: true
            });
        });

        return;
	} 
}; 