// Dependencies

let Telegraf = require('telegraf')

// Local Packages

let config = require('../config.json')
let Log = require('../log')
let Lang = require('../lang').Lang


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
        case 'start':
            Log.Log.debug("Telegram Bot: " + config.botname + Lang.app.starting)
            Bot.telegram.setWebhook(config.webhook.url)
            Bot.launch()
            break
        case 'stop':
            Bot.stop()
            break;
    }
}

exports.command = command
exports.Ctl = Ctl
exports.Bot = Bot