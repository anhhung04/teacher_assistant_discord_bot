module.exports ={
    name: 'test',
    async execute(mess){
        return mess.member.voice.channel.messages.channel.send('test successfully')
    }
}