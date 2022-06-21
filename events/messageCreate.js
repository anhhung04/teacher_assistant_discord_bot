const {prefix} = require('../config.json');
const fs = require('fs');
const commandFiles = fs.readdirSync('./messageCommands').filter(file => file.endsWith('.js'));
const commands = new Map();

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
        return command.execute(mess);
    }
}