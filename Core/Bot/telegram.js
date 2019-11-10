// Dependencies

let Telegraf = require('telegraf')
let SocksProxyAgent = require('socks-proxy-agent');

// Local Packages

let config = require('../../config.json')
let Log = require('../log')
let Lang = require('../lang').Lang
let packageInfo = require('../../package.json')
let Component = require('../../component')

let channelTime = new Date()

// Proxy
// SOCKS proxy to connect to
let proxy = process.env.socks_proxy || config.proxy.url

// create an instance of the `SocksProxyAgent` class with the proxy server information
let agent = new SocksProxyAgent(proxy)

// Creating Bot
// At this time Single User

let Bot

if(config.proxy.enable) {
    Bot = new Telegraf(config.token, { telegram: { agent: agent } }).catch(err => {
        Log.DiagnosticLog.fatal(err)
    })
}
else {
    Bot = new Telegraf(config.token).catch(err => {
        Log.DiagnosticLog.fatal(err)
    })
}

let command = (cmd) => {
    let webhookPort
    let webhookUrl
    let args = cmd.split(" ")
    switch (args[1]) {
        default:
            console.log("Yawarakai: " + cmd + " " + Lang.bot.telegram.commandInvalid)
            break
        case 'h':
        case 'help':
            console.log(Lang.bot.telegram.helpCommand)
            break
        case 'set':
            for (var i = 1; i < args.length; i++) {
                if (!args[2]) {
                    console.log("Using default settings")
                    webhookUrl = config.webhook.url
                    webhookPort = config.webhook.port != undefined ? config.webhook.port : 8000
                    Bot.telegram.setWebhook(config.webhook.url).catch(err => Log.Log.fatal(err))
                }
                if (args[i] === "--l" && args[i + 1] != undefined) {
                    webhookUrl = args[i + 1]
                    console.log(`webhook set to ${webhookUrl}`)
                    Bot.telegram.setWebhook(args[i + 1])
                }
                if (args[i] === "--p" && args[i + 1] != undefined) {
                    webhookPort = args[i + 1]
                    console.log(`webhook set to ${webhookPort}`)
                    webhookPort = args[i + 1]
                }
                if ((args[i] === "--l" && args[i + 1] == undefined) || (args[i] === "--p" && args[i + 1] == undefined)) {
                    // Display error if  option is invalid
                    console.log(Lang.bot.telegram.commandParameterMissing[0] + args[2] + Lang.bot.telegram.commandParameterMissing[1])
                    Log.AnonymousLog.trace(Lang.app.commandExecution + ": " + cmd)
                }
                if (args[i] === "--n") {
                    console.log(`current on ${webhookUrl}:${webhookPort}`)
                }
            }
            break
        case 'start':
            Log.Log.info("Telegram Bot: " + config.botname + Lang.app.starting)
            Log.Log.info(`Webhook: ${webhookUrl = webhookUrl ? webhookUrl : config.webhook.url == '' ? "127.0.0.1" : config.webhook.url}:${webhookPort = webhookPort ? webhookPort : config.webhook.port}`)
            Log.Log.warning(`${Lang.bot.telegram.webhookSettingsWarning}`)
            Bot.telegram.sendMessage(config.diagnosticChannel.channel,`${config.botname} ${packageInfo.version} Connected to Telegram\n${channelTime.toISOString()}\n${Component.loadedPlugins.join("\n")}`)
            webhookUrl != undefined ? Bot.telegram.setWebhook(webhookUrl).catch(err => Log.Log.fatal(err)) : Bot.telegram.setWebhook("127.0.0.1")
            Bot.startWebhook('/', null, webhookPort != undefined ? webhookPort : 8000)
            break
        case 'debug':
            Log.Log.info("Telegram Bot: " + config.botname + Lang.app.starting)
            Log.Log.info(`Webhook: ${webhookUrl = webhookUrl ? webhookUrl : config.webhook.url == '' ? "127.0.0.1" : config.webhook.url}:${webhookPort = webhookPort ? webhookPort : config.webhook.port}`)
            Log.Log.warning(`${Lang.bot.telegram.webhookSettingsWarning}`)
            config.webhook.url != undefined || config.webhook.url != "" ? Bot.telegram.setWebhook(config.webhook.url).catch(err => Log.Log.fatal(err)) : Bot.telegram.setWebhook("127.0.0.1")
            Bot.startWebhook('/', null, webhookPort != undefined ? webhookPort : 8000)
            break
        case 'stop':
            Bot.stop()
            break
    }
}

exports.command = command
exports.Bot = Bot