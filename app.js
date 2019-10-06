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

// Local Packages

let Log = require('./log').Log
let AnonymousLog = require('./log').AnonymousLog
let Core = require('./core')
let Bot = require('./bot')
let Lang = require('./lang').Lang
let config = require('./config.json')
let Component = require('./component')
let packageInfo = require('./package.json')

// Core Runtime

var startInfo = Lang.app.startTime + "：" + Date() + " - " + config.botname + " " + Lang.app.coreVersion + ": " + packageInfo.version

console.log("Yawarakai  Copyright (C) 2019  Yuna Hanami")
console.log(startInfo)
AnonymousLog.info(startInfo)

// Debug block

if (config.debugmode) {
    Bot.Telegram.command("/telegram start")
    Core.setKey("nlpfeedback", false)
    Core.getKey("nlpfeedback").then(res => {
        Log.debug(`NLP set to ${res}`)
    })
}

// Initialization

var compoData = Component.Register.load()

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
    for (let i of method) {
        let detail = []
        const idx = method.indexOf(i)
        try {
            const res = await Reflect.apply(method[idx].instance, undefined, args)
            detail.push(res)
        } catch (err) {
            Log.fatal(err)
        }
        return detail
    }
}
function commandDistributor(ctx) {
    commandParse(ctx, (result) => {
        const chatID = ctx.from.id
        let cmd = compoData.command.find(command => {
            // console.log(command.command === result.cmd)
            return command.command === result.cmd
        })
        if (!cmd) { return 404 }
        Reflect.apply(cmd.instance, { chat: ctx.message.text, bot: "bot", chatID }, result.args)
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
    ctx.answerInlineQuery(data, { cache_time: 10})
})

Bot.Telegram.Bot.on("command", async ctx => {
    commandDistributor(ctx)
})

Bot.Telegram.Bot.on("text", async (ctx) => {
    Bot.Message.messagectl.logMsg(ctx)
    Bot.Message.Message.hears(ctx)
    Bot.Message.Nlp.tag(ctx, ctx.message.text).then(res => {
        ctx.reply(JSON.stringify(res))
    })
})

// Log

Bot.Telegram.Bot.catch((err) => {
    Log.fatal(err)
    throw err
})