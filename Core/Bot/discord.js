const Discord = require('discord.js')
const client = new Discord.Client()
let config = require('../../config.json')

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
})

client.on('message', msg => {
  if (msg.content === 'ping') {
    msg.reply('pong');
  }
});

if (config.discord.enable) {
  client.login(config.discord.token);
}

exports.Bot = client
