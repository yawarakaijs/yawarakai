/**************************************************************************
    
    yawarakai: A running core that support many neural network models which works for NLP or providing solution
    Copyright (C) 2019  Yuna Hanami

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>

 *************************************************************************/

/**
 * @author Hanami Yuna
 * @copyright
 */

// Local Packages

let Log = require('./Core/log').Log
let AnonymousLog = require('./Core/log').AnonymousLog
let DiagnosticLog = require('./Core/log').DiagnosticLog
let Core = require('./core')
let Bot = require('./Core/bot')
let Nlp = require('./Core/Bot/nlp').Nlp
let Lang = require('./Core/lang').Lang
let config = require('./config.json')
let Component = require('./component')
let packageInfo = require('./package.json')

// Core Runtime

let timeOption = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
let startInfo = Lang.app.startTime + "：" + Date() + " - " + config.botname + " " + Lang.app.coreVersion + ": " + packageInfo.version
let channelTime = new Date()

console.log("Yawarakai  Copyright (C) 2019  Yuna Hanami")
console.log(startInfo)
AnonymousLog.info(startInfo)

// Initialization

var compoData = Component.Register.load()

// Debug block

if (config.debugmode) {
    Bot.Telegram.command("/telegram start")
    Core.setKey("nlpfeedback", false)
    Core.getKey("nlpfeedback").then(res => {
        Log.debug(`NLP set to ${res}`)
    })
    Core.getKey("nlpAnalyzeIds").then(res => {
        Log.debug(`NLP Analyzer List: ${res}`)
    }).catch(err => {
        Core.setKey("nlpAnalyzeIds", "[]")
    })
}
else {
    DiagnosticLog.info(`${config.botname} ${packageInfo.version} Connected to Telegram\n${channelTime.toISOString()}\n${Component.loadedPlugins.join("\n")}`)
    Core.setKey("nlpfeedback", false)
    Core.getKey("nlpfeedback").then(res => {
        Log.debug(`NLP set to ${res}`)
    })
    Core.getKey("nlpAnalyzeIds").then(res => {
        Log.debug(`NLP Analyzer List: ${res}`)
    }).catch(err => {
        Core.setKey("nlpAnalyzeIds", "[]")
    })
}

// Common Functions

function commandParse(ctx, callback) {
    let commandArgs = ctx.message.text.split(" ");
    let command = commandArgs[0].substr(1);
    let args = [];
    commandArgs.forEach((value, index) => {
        if (index > 0 && value !== "") {
            args.push(value);
        }
    })
    callback({
        cmd: command,
        args: args,
        ctx: ctx
    });
}

async function inlineDistributor(ctx) {
    let args = []
    args.push(ctx)
    var method = compoData.inline
    let detail
    for (let i of method) {
        detail = new Array()
        const idx = method.indexOf(i)
        try {
            const res = await Reflect.apply(method[idx].instance, undefined, args)
            detail.push(res)
        } catch (err) {
            DiagnosticLog.fatal(err)
        }
    }
    return detail
}
function commandDistributor(ctx) {
    commandParse(ctx, (result) => {
        const chatID = ctx.from.id
        let cmd = compoData.command.find(command => {
            // console.log(command.command === result.cmd)
            return command.command === result.cmd
        })
        if (!cmd) { return 404 }
        return Reflect.apply(cmd.instance, { chat: ctx.message.text, bot: "bot", chatID }, result.args)
    })
}

function staticCommandDistributor(ctx) {
    commandParse(ctx, (result) => {
        
    })
}

// CLI

Core.cliInput('> ', input => {
    var command = input.split(' ')[0] // Cut Command and set to First string
    var isCommand = command.includes("/") && (command.indexOf("/") == 0) // Check command type
    if (isCommand) {
        switch (command) {
            default:
                console.log(config.coreName + ": " + input + ": " + Lang.app.cliCommandUnknownPrompt)
                AnonymousLog.trace(Lang.app.commandExecution + ": " + input)
                break
            case '/telegram':
                Bot.Telegram.command(input)
                break
            case '/help':
                console.log(Lang.app.cliAvailiableCommand + ": /telegram | /help | /[exit|stop]")
                break
            case '/scan':
                Component.ComponentControl.scan()
                break
            case '/load':
                Component.ComponentControl.load()
                break
            case '/stop':
            case '/exit':
                return false;
        }
    }
    else { // Basic session processing and exception handling
        switch (input) {
            default:
                break
            case '':
                break
        }
    }
})

// Essentials

Bot.Telegram.Bot.on("inline_query", async ctx => {
    let data = await inlineDistributor(ctx)
    ctx.answerInlineQuery(data, { cache_time: 10 })
})

Bot.Telegram.Bot.on("command", async ctx => {
    staticCommandDistributor(ctx)
    commandDistributor(ctx)
})

Bot.Telegram.Bot.on("text", async (ctx) => {
    Core.setKey("telegramMessageText", ctx.message.text)
    Core.setKey("telegramMessageFromId", ctx.from.id)
    Bot.Message.Message.hears(ctx)
    Nlp.tag(ctx, ctx.message.text).then(res => {
        ctx.replyWithChatAction("typing")
        let text = res
        if (text != undefined) {
            Core.getKey("nlpAnalyzeIds").then(ids => {
                let current = JSON.parse(ids)
                current.map(item => {
                    if(item == ctx.from.id) {
                        ctx.reply(text, {parse_mode: "Markdown"}).catch(err => {
                            DiagnosticLog.fatal(err)
                        })
                    }
                })
            })
        }
    })
    Bot.Message.messagectl.log(ctx)
})

// Bot.Telegram.Bot.on("voice", async (ctx) => {
//     console.log(JSON.stringify(ctx.message))
// })

// Log

Bot.Telegram.Bot.catch((err) => {
    DiagnosticLog.fatal(err)
    throw err
})