// Dependencies

let readline = require('readline')
let process = require('process')

// Local

let Log = require("./Core/log")
let config = require("./config.json")
let Telegram = require("./Core/Bot/telegram")
let Lang = require('./Core/lang')
let packageInfo = require('./package.json')
let Component = require('./component')
let Admin = require('./Core/Bot/admin')

let channelTime = new Date()
let Bot = Telegram.Bot

// Time Control

let SysTime = new Date()
let Time = {
  Date: SysTime,
  runningTime: SysTime.getFullYear() + "-" + ("0" + (SysTime.getMonth() + 1)).slice(-2) + "-" + ("0" + SysTime.getDate()).slice(-2) + "-" + ("0" + SysTime.getHours()).slice(-2) + "-" + ("0" + SysTime.getMinutes()).slice(-2) + "-" + ("0" + SysTime.getSeconds()).slice(-2),
  logTime: SysTime.getFullYear() + "-" + ("0" + (SysTime.getMonth() + 1)).slice(-2) + "-" + ("0" + SysTime.getDate()).slice(-2)
}

// CLI

const rl = readline.createInterface(process.stdin, process.stdout)

function promptInput(prompt, handler) {
  rl.question(prompt, input => {
    if (handler(input) !== false) {
      promptInput(prompt, handler)
    }
    else {
      rl.close()
    }
  })
}

let offline = {
  
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
                  webhookUrl = config.telegram.webhook.url
                  webhookPort = config.telegram.webhook.port != undefined ? config.telegram.webhook.port : 8000
                  Bot.telegram.setWebhook(config.telegram.webhook.url).catch(err => Log.Log.fatal(err))
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
          Log.Log.info("Telegram Bot: " + config.telegram.botname + Lang.app.starting)
          Log.Log.info(`Webhook: ${webhookUrl = webhookUrl ? webhookUrl : config.telegram.webhook.url == '' ? "127.0.0.1" : config.telegram.webhook.url}:${webhookPort = webhookPort ? webhookPort : config.telegram.webhook.port}`)
          Log.Log.warning(`${Lang.bot.telegram.webhookSettingsWarning}`)
          if(config.telegram.diagnosticChannel.enable) {
              Bot.telegram.sendMessage("@" + config.telegram.diagnosticChannel.channel,`📄 Info\n${config.telegram.botname} ${packageInfo.version} Connected to Telegram\n${channelTime.toISOString()}\n${Component.compoInfo.join("\n")}`).catch(err => Log.Log.fatal(err))
          }
          webhookUrl != undefined ? Bot.telegram.setWebhook(webhookUrl).catch(err => Log.Log.fatal(err)) : Bot.telegram.setWebhook("127.0.0.1")
          Bot.startWebhook('/', null, webhookPort != undefined ? webhookPort : 8000)
          break
      case 'debug':
          Log.Log.info("Telegram Bot: " + config.telegram.botname + Lang.app.starting)
          Log.Log.info(`Webhook: ${webhookUrl = webhookUrl ? webhookUrl : config.telegram.webhook.url == '' ? "127.0.0.1" : config.telegram.webhook.url}:${webhookPort = webhookPort ? webhookPort : config.telegram.webhook.port}`)
          Log.Log.warning(`${Lang.bot.telegram.webhookSettingsWarning}`)
          config.telegram.webhook.url != undefined || config.telegram.webhook.url != "" ? Bot.telegram.setWebhook(config.telegram.webhook.url).catch(err => Log.Log.fatal(err)) : Bot.telegram.setWebhook("127.0.0.1")
          Bot.startWebhook('/', null, webhookPort != undefined ? webhookPort : 8000)
          break
      case 'stop':
          Bot.stop()
          break
      case 'admin':
          Admin.cli(args)
          break
  }
}

exports.command = command
exports.cliInput = promptInput
exports.Time = Time