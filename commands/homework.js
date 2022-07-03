const { SlashCommandBuilder, hyperlink} = require('@discordjs/builders');
const {MessageEmbed, MessageActionRow, MessageSelectMenu} = require('discord.js');
const homeworkModel = require('../models/homework.js');

const data = new SlashCommandBuilder()
.setName('homework') 
.setDescription('Theo dõi trạng thái các bài tập đã nộp.');

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
        await interaction.deferReply({ephemeral: true});

        const homeworks = await homeworkModel.find({guildId: interaction.guildId, authorId: interaction.member.id}).sort({createAt: -1}).limit(10);
        const fields = homeworks.map(h => ({name: h.name, value: statusObj[h.status]}));
        const options = homeworks.map(h => ({label: h.name, value: h.messageId}));
        var components = [];
        
        const embedSend = new MessageEmbed()
        .setColor('BLUE')
        .setTimestamp()
       
        if(fields?.length>0){
            embedSend.setTitle('Danh sách (<=10) bài tập đã nộp gần nhất: ').addFields(fields);
        }else{
            embedSend.setDescription('Bạn chưa nộp bất kỳ bài tập nào.');
        }

        const row = new MessageActionRow()
        .addComponents(new MessageSelectMenu()
        .setCustomId('select_homework_to_view')
        .addOptions(options)
        .setMinValues(1)
        .setPlaceholder('Chọn bài tập đã nộp để xem chi tiết.'));

        if(!embedSend.description){
            components.push(row);
        }

        const mess = await interaction.editReply({
            embeds: [embedSend],
            components: components
        });

        const collector = await mess.createMessageComponentCollector({componentType: 'SELECT_MENU', max: 1});

        collector.on('collect',async (i) => {
            await i.deferReply({ephemeral: true});

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