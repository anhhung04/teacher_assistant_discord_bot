module.exports = {
	name: 'interactionCreate',
	async execute(interaction) {
        if(interaction.isModalSubmit()){
           let modalId = interaction.customId;
           let modal = interaction.client.modals.get(modalId);

           if(!modal) return;

           try{
                modal.execute(interaction);
           }catch(err){
                console.error(error);
                await interaction.reply({ content: 'Đã có lỗi xảy ra!', ephemeral: true });
           }
        }

		if (!interaction.isCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Đã có lỗi xảy ra!', ephemeral: true });
        }
	},
};