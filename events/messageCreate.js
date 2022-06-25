const {prefix} = require('../config.json');
const fs = require('fs');
const commandFiles = fs.readdirSync('./messageCommands').filter(file => file.endsWith('.js'));
const commands = new Map();
const cooldowns = new Map();

for(let file of commandFiles){
    let command = require(`../messageCommands/${file}`);
    commands.set(command.name, command);
}

module.exports ={
    name: 'messageCreate',
    async execute(mess){
        if(mess.author.bot||mess.content.slice(0, prefix.length)!==prefix) return;
        var args = mess.content.slice(prefix.length).split(/\s+/);
        var commandName = args.shift();
        const command = commands.get(commandName);
        if(!command) return mess.channel.send('There was an error when executing command!');

        if (!cooldowns.has(command.name)) {
            cooldowns.set(command.name, new Map());
        }
    
        const now = Date.now();
        const timestamps = cooldowns.get(command.name);
        const cooldownAmount = (command.cooldown || 3) * 1000;
    
        if (timestamps.has(mess.author.id)) {
            const expirationTime = timestamps.get(mess.author.id) + cooldownAmount;
    
            if (now < expirationTime) {
                // If user is in cooldown
                const timeLeft = (expirationTime - now) / 1000;
                return mess.reply(`Hãy chờ ${timeLeft.toFixed(1)} giây trước khi sử dụng lệnh \`${command.name}\`.`);
            }
        } else {
            timestamps.set(mess.author.id, now);
            setTimeout(() => timestamps.delete(mess.author.id), cooldownAmount);
            // Execute command
            try {
                return command.execute(mess, args);
            } catch (error) {
                console.error(error);
                mess.reply('Đã có lỗi xảy ra!');
            }
        }

        return;
    }
}