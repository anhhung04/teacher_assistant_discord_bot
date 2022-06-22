const {MessageEmbed} = require('discord.js');

module.exports = async function(color = 'BLUE', title=null, description=null, fields, thumbnailLink=null, imageLink=null){
    var embed = new MessageEmbed().setTimestamp().setColor(color);

    if(title&&typeof(title)==='string'){
        embed.setTitle(title);
    }

    if(description&&typeof(description)==='string'){
       embed.setDescription(description);
    }

    if(fields&&fields?.length>0&&Array.isArray(fields)&&fields.map(f => f.name).length===fields.map(f => f.value).length){
        embed.setFields(...fields);
    }

    if(imageLink&&typeof(imageLink)==='string'){
        embed.setImage(imageLink);
    }

    if(thumbnailLink&&typeof(thumbnailLink)==='string'){
        embed.setThumbnail(thumbnailLink);
    }

    return embed;
}