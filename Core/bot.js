// Dependencies

// Local Files

let Core = require('../core')
let Message = require('./Bot/message')
let Command = require('./Bot/command')
let Telegram = require('./Bot/telegram')
let Component = require('../component')

let config = require('../config.json')

// Bot Method

let Nlp = require('./Bot/nlp').Nlp
let Log = require('../Core/log').Log

let compoData = Component.Register.load()

let Bot = {
    commandParse: function (ctx, callback) {
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
    },
    inlineDistributor: async function (ctx) {
        let args = []
        args.push(ctx)
        let method = compoData.inline
        let detail = new Array()
        let result = new Array()
        for (let i of method) {
            const idx = method.indexOf(i)
            try {
                const res = await method[idx].instance.call(this, ctx)
                if (res != undefined) {
                    detail.push(res)
                }
            } catch (err) {
                DiagnosticLog.fatal(err)
            }
        }
        if(detail.length == 1 || detail.length >= 2) {
            detail.map(resArray => { resArray.map(item => result.push(item)) })
            return result
        }
        else { return undefined }
    },
    callbackQueryDistributor: async function (ctx) {
        let args = []
        args.push(ctx)
        let method = compoData.callbackQuery
        let detail
        for (let i of method) {
            const idx = method.indexOf(i)
            try {
                const res = await method[idx].instance.call(this, ctx)
                if (res != undefined) {
                    detail = res
                }
            } catch (err) {
                DiagnosticLog.fatal(err)
            }
        }
        return detail
    },
    commandDistributor: function (ctx) {
        commandParse(ctx, (result) => {
            const chatID = ctx.from.id
            let cmd = compoData.command.find(command => {
                // console.log(command.command === result.cmd)
                return command.command === result.cmd
            })
            if (!cmd) { return 404 }
            return Reflect.apply(cmd.instance, { chat: ctx.message.text, bot: "bot", chatID }, result.args)
        })
    },
    staticCommandDistributor: function (ctx) {
        commandParse(ctx, (result) => {

        })
    }
}
let DiagnosticLog = {
    info: (text) => {
        DiagnosticLog.counter(text)
        if (config.diagnosticChannel.enable) {
            Telegram.Bot.telegram.sendMessage(`${config.diagnosticChannel.channel}`, "📄 Info\n" + text)
        }
    },
    debug: (text) => {
        DiagnosticLog.counter(text)
        if (config.diagnosticChannel.enable && DiagnosticLog.count == 0) {
            Telegram.Bot.telegram.sendMessage(`${config.diagnosticChannel.channel}`, "⚙️ Debug\n" + text)
        }
        Log.debug(text)
    },
    warning: (text) => {
        DiagnosticLog.counter(text)
        if (config.diagnosticChannel.enable && DiagnosticLog.count == 0) {
            Telegram.Bot.telegram.sendMessage(`${config.diagnosticChannel.channel}`, "⚠️ Warning\n" + text)
        }
        Log.warning(text)
    },
    fatal: (text) => {
        DiagnosticLog.counter(text)
        if (config.diagnosticChannel.enable && DiagnosticLog.count == 0) {
            let stack
            if (__dirname.includes(":\\")) {
                let trimmer = __dirname.replace(/\\Core/gu, "")
                trimmer = trimmer.replace(/\\/gmui, `\\\\\\\\`)
                trimmer = new RegExp(trimmer, "gu")
                stack = JSON.stringify(text.stack).replace(trimmer, ".")
            }
            else {
                let trimmer = new RegExp(__dirname.replace(/\/Core/gu, ""), "gu")
                stack = JSON.stringify(text.stack).replace(trimmer, ".")
            }
            Telegram.Bot.telegram.sendMessage(`${config.diagnosticChannel.channel}`, "🚨 Fatal\n" + JSON.parse(stack))
        }
        Log.fatal(text)
    },
    counter: (text) => {
        Core.getKey("logtext").then(res => {
            if (text.message == res) {
                DiagnosticLog.count++
            }
            if (text.message != res) {
                DiagnosticLog.count = 0
            }
            Core.setKey("logtext", text.message ? text.message : "", 'EX', 1 * 60)
        })
    },
    count: 0
}

let Control = {
    start: function () {
        Telegram.Bot.on("callback_query", async (ctx) => {
            let keyboard = await Bot.callbackQueryDistributor(ctx)
            Telegram.Bot.telegram.editMessageText(ctx.callbackQuery.message.chat.id, ctx.callbackQuery.message.message_id, ctx.callbackQuery.id, "Meow meow\nMeow Meow", { reply_markup: { inline_keyboard: keyboard } })
        })

        Telegram.Bot.on("chosen_inline_result", async (ctx) => {
            console.log(ctx.chosenInlineResult)
        })

        Telegram.Bot.on("inline_query", async ctx => {
            let data = await Bot.inlineDistributor(ctx)
            if (data != undefined) {
                // Exchange all id of inline result to the system registered id
                data.map(item => {
                    let id = new Array()
                    for (let i = 0; i < 8; i++) {
                        id.push(Math.floor(Math.random() * Math.floor(9)))
                    }
                    item["id"] = id.join("")
                })
                ctx.answerInlineQuery(data, { cache_time: 10 }).catch(err => DiagnosticLog.fatal(err))
            }
            else if (data == undefined) {
                ctx.answerInlineQuery([
                    {
                        type: "article",
                        id: ctx.inlineQuery.id,
                        title: `没有找到你想要的东西呢`,
                        description: "Didn't find what you need",
                        thumb_url: "https://i.loli.net/2019/11/06/ykCwSbm68WUoYPv.jpg",
                        input_message_content: { message_text: `没有你需要的结果` }
                    }
                ], { cache_time: 1 }).catch(err => DiagnosticLog.fatal(err))
            }
        })

        Telegram.Bot.on("command", async ctx => {
            // Bot.staticCommandDistributor(ctx)
            Bot.commandDistributor(ctx)
        })

        Telegram.Bot.on("text", async (ctx) => {
            Core.setKey("telegramMessageText", ctx.message.text)
            Core.setKey("telegramMessageFromId", ctx.from.id)
            Message.Message.hears(ctx)
            Nlp.tag(ctx, ctx.message.text).then(res => {
                ctx.replyWithChatAction("typing")
                let text = res
                if (text != undefined) {
                    Core.getKey("nlpAnalyzeIds").then(ids => {
                        let current = JSON.parse(ids)
                        current.map(item => {
                            if (item == ctx.from.id) {
                                ctx.reply(text, { parse_mode: "Markdown" }).catch(err => {
                                    DiagnosticLog.fatal(err)
                                })
                            }
                        })
                    })
                }
            })
            Message.messagectl.log(ctx)
        }).catch(err => DiagnosticLog(err))
        
        // Log
        Telegram.Bot.catch((err) => {
            DiagnosticLog.fatal(err)
            throw err
        })
    }
}

exports.Core = Core
exports.Control = Control
exports.Message = Message
exports.Command = Command
exports.Telegram = Telegram