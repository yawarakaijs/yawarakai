// Dependencies

let Telegraf = require('telegraf')
//const SocksAgent = require('socks5-https-client/lib/Agent');

// Local Packages

let config = require('../config.json')
let Log = require('../log')
let Lang = require('../lang').Lang

/*
const socksAgent = new SocksAgent({
    socksHost: config.proxy.host,
    socksPort: config.proxy.port
})
*/

// Creating Bot
// At this time Single User
const Bot = new Telegraf(config.token)

let Ctl = {
    
}

let command = (cmd) => {
    var args = cmd.split(" ")
    switch (args[1]) {
        default:
            console.log(cmd + " " + Lang.bot.telegram.commandInvalid)
            break
        case 'h':
        case 'help':
            console.log(Lang.bot.telegram.helpCommand)
            break
        case 'set':
            Bot.telegram.setWebhook(config.webhook.url)
            break
        case 'start':
            Log.Log.debug("Telegram Bot: " + config.botname + Lang.app.starting)
            Bot.startWebhook('/', null, config.webhook.port)
            break
        case 'stop':
            Bot.stop(() => Log.Log.info("Shutting down..."))
            return
    }
    return
}

exports.command = command
exports.Ctl = Ctl
exports.Bot = Bot