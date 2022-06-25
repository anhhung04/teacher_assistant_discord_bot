const cooldowns = new Map();


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

        if (!cooldowns.has(interaction.commandName)) {
            cooldowns.set(interaction.commandName, new Map());
        }
        
        const now = Date.now();
        const timestamps = cooldowns.get(interaction.commandName);
        const cooldownAmount = (3) * 1000;
        
        if (timestamps.has(interaction.member.id)) {
            const expirationTime = timestamps.get(interaction.member.id) + cooldownAmount;
        
            if (now < expirationTime) {
                // If user is in cooldown
                const timeLeft = (expirationTime - now) / 1000;
                return interaction.reply({content: `Hãy chờ ${timeLeft.toFixed(1)} giây trước khi sử dụng lệnh \`${interaction.commandName}\`.`, ephemeral: true});
            }
        } else {
            timestamps.set(interaction.member.id, now);
            setTimeout(() => timestamps.delete(interaction.member.id), cooldownAmount);
            // Execute command
            try {
                return command.execute(interaction);
            } catch (error) {
                console.error(error);
                interaction.reply({ content: 'Đã có lỗi xảy ra!', ephemeral: true });
            }
        }
        
        return;
	},
};