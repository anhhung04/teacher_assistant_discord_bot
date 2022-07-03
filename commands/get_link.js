const { SlashCommandBuilder} = require('@discordjs/builders');
const embed = require('../utilities/embed.js');

const data = new SlashCommandBuilder()
.setName('get_link') 
.setDescription('Tạo link từ file (dưới 10 mb)')
.addAttachmentOption(opt => opt.setName('file').setDescription('File muốn lấy link').setRequired(true));

module.exports = {
	data: data, 
	async execute(interaction){
        const fileURL = interaction.options.getAttachment('file');

        await interaction.deferReply({ ephemeral: true});

        return interaction.editReply({
            embeds: [await embed('BLUE', 'Đây là link của bạn: ', fileURL.url)]
        });
	} 
}; 