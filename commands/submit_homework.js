const { SlashCommandBuilder } = require('@discordjs/builders');

const data = new SlashCommandBuilder()
    .setName('submit_homework')
    .setDescription('Nộp bài tập')
    .addAttachmentOption(opt => opt.setName('file').setDescription('File bài tập').setRequired(true));

module.exports = {
    data: data,
    async execute(interaction){
        return interaction.reply({
            content: 'Đã nhận file đính kèm',
            ephemeral: true
        });
    }
}