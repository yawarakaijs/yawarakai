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
            var count, err
            var num = 2
            args.forEach(element => {
                if(element === "--l" || element === "--url" && args[count+1]) {
                    Bot.telegram.setWebhook(args[count+1])
                }
                else if(element === "--p" || element === "--port" && args[count+1]) {
                    webhookPort = args[count+1]
                }
                else if(element === "--l" || element === "--url" && !args[count+1]) {
                    num = count + 1
                    err = true
                }
                else if(element === "--p" || element === "--port" && !args[count+1]) {
                    num = count + 1
                    err = true
                }
                else if(args[2]) {
                    num = count + 1
                    err = true
                }
                else if(config.webhook.url){
                    console.log("Using default settings")
                    webhookPort = config.webhook.port != undefined ? config.webhook.port : 8000
                    Bot.telegram.setWebhook(config.webhook.url)
                }
                count++
            })
            if(err) {
                // Display error if  option is invalid
                console.log(num)
                console.log(Lang.bot.telegram.commandParameterMissing[0] + args[num] + Lang.bot.telegram.commandParameterMissing[1])
                Log.AnonymousLog.trace( Lang.app.commandExecution + ": " + cmd)
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