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
    var webhookPort
    var args = cmd.split(" ")
    switch (args[1]) {
        default:
            console.log("Yawarakai: " + cmd + " " + Lang.bot.telegram.commandInvalid)
            break
        case 'h':
        case 'help':
            console.log(Lang.bot.telegram.helpCommand)
            break
        case 'set':
            for(var i = 0; i < args.length; i++) {
                if(!args[2]) {
                    console.log("Using default settings")
                    webhookPort = config.webhook.port != undefined ? config.webhook.port : 8000
                    Bot.telegram.setWebhook(config.webhook.url)
                }
                if(args[i] === "--l" && args[i+1] != undefined) {
                    console.log("Webhook [OK]")
                    Bot.telegram.setWebhook(args[i+1])
                }
                if(args[i] === "--p" && args[i+1] != undefined) {
                    console.log("Webhook Port [OK]")
                    webhookPort = args[i+1]
                }
                if((args[i] === "--l" && args[i+1] == undefined) || (args[i] === "--p" && args[i+1] == undefined)) {
                    // Display error if  option is invalid
                    console.log(Lang.bot.telegram.commandParameterMissing[0] + args[2] + Lang.bot.telegram.commandParameterMissing[1])
                    Log.AnonymousLog.trace( Lang.app.commandExecution + ": " + cmd)
                }
            }
            break
        case 'start':
            Log.Log.debug("Telegram Bot: " + config.botname + Lang.app.starting)
            Bot.startWebhook('/', null, webhookPort != undefined ? webhookPort : 8000)
            break
        case 'stop':
            Bot.stop()
            break;
    }
}

exports.command = command
exports.Ctl = Ctl
exports.Bot = Bot