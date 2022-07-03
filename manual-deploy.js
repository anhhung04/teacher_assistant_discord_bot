const deployCommandsGuild = require('./deploy-commands-guild.js');
require('dotenv').config();
const token = process.env.TOKEN;
const { Client, Intents } = require('discord.js');
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS, 
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_MESSAGE_TYPING,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_BANS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_INVITES,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
        Intents.FLAGS.GUILD_SCHEDULED_EVENTS,
        Intents.FLAGS.GUILD_WEBHOOKS,
        Intents.FLAGS.GUILD_INTEGRATIONS
    ],
    partials: [
    "CHANNEL"
    ]
});

const getServerAndDeploy = function(){
    let findGuild = new Promise((resolve, reject)=>{
        let guilds = client.guilds.cache.toJSON();
        console.log(client.guilds)
        if(guilds){
            resolve(guilds);
        }else{
            reject('nothing');
        }
    });
    findGuild
        .then(async guilds => {
            for(let i=0; i< guilds.length; i++){
                let guild = guilds[i];
                await deployCommandsGuild(guild.id);
            }
            process.exit();
        })
        .catch(err => {
            console.log(err);
        });
};

client.once('ready', client => console.log(`Logged in as ${client.user.tag}`));

client.login(token).then(value => getServerAndDeploy());
        
        







