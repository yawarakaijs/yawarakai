// Dependencies

// Local Files

let Core = require('../core')
let Message = require('./Bot/message')
let Command = require('./Bot/command').Command
let Telegram = require('./Bot/telegram')
let Component = require('../component')

let config = require('../config.json')

// Bot Method

let Nlp = require('./Bot/nlp').Nlp
let Log = require('../Core/log').Log
let Lang = require('./lang')

function reload() {
    delete require.cache[require.resolve('../component')]
    Component = require('../component')
    Component.Register.load()
}

Component.Register.load()

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
            Telegram.Bot.telegram.sendMessage(`@${config.diagnosticChannel.channel}`, "🚨 Fatal\n" + JSON.parse(stack))
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

let Bot = {
    telegram: Telegram.Bot.telegram,
    DiagnosticLog: DiagnosticLog,
    commandParse: function (ctx, callback) {
        let commandArgs = ctx.message.text.split(" ")
        let command = commandArgs[0].substring(1)
        command = command.replace(/@\w+/g, "")
        let args = []
        commandArgs.forEach((value, index) => {
            if (index > 0 && value !== "") {
                args.push(value)
            }
        })
        return {
            cmd: command,
            args: args,
            ctx: ctx,
            telegram: Telegram.Bot.telegram,
            compo: Component.Compo
        }
    },
    inlineDistributor: async function (ctx) {
        let method = Component.Compo.inline
        let detail = new Array()
        let result = new Array()
        for (let i of method) {
            try {
                const res = await i.instance.call(this, ctx)
                if (res != undefined) {
                    detail.push(res)
                }
            } catch (err) {
                DiagnosticLog.fatal(err)
            }
        }
        if (detail.length == 1 || detail.length >= 2) {
            detail.map(resArray => { resArray.map(item => result.push(item)) })
            return result
        }
        else { return undefined }
    },
    callbackQueryDistributor: async function (ctx) {
        let args = []
        args.push(ctx)
        let method = Component.Compo.callbackQuery
        let detail
        for (let i of method) {
            const idx = method.indexOf(i)
            try {
                const res = await i.instance.call(this, ctx)
                if (res != undefined) {
                    detail = res
                }
            } catch (err) {
                DiagnosticLog.fatal(err)
            }
        }
        return detail
    },
    commandDistributor: async function (ctx) {
        let result = Bot.commandParse(ctx)
        let cmd = Component.Compo.command.find(command => {
            return command.function === result.cmd
        })
        if (!cmd) { return 404 }
        return await cmd.instance.call(this, result)
    },
    staticCommandDistributor: function (ctx) {
        let result = Bot.commandParse(ctx)
        let data = Command.switcher(result)
        if (data != undefined) {
            return data
        }
        else {
            return undefined
        }
    },
    messasgeDistributor: async function (ctx) {
        let method = Component.Compo.message
        let result = undefined
        for (let i of method) {
            try {
                const res = await i.instance.call(this, ctx)
                if (res != undefined) {
                    result = res
                }
            } catch (err) {
                DiagnosticLog.fatal(err)
            }
        }
        return result
    }
}

let Control = {
    start: function () {
        
        /**
         * Handle new chat member
         */
        Telegram.Bot.on("new_chat_members", async (ctx) => {
            let newMember = ctx.update.message.new_chat_member
            if(!ctx.update.message.new_chat_member.is_bot && config.debugmode) {
                let name = newMember.first_name != "" && newMember.first_name != undefined ? newMember.first_name : newMember.username ? newMember.username : newMember.id
                Telegram.Bot.telegram.sendMessage(ctx.message.chat.id, `欢迎新朋友 [${name}](tg://user?id=${newMember.id}) !\n如果是第一次来到乐园的话，建议和大家自我介绍一下哦（当然也不会勉强了啦）\n希望乃在花見乐园能够玩的开心呢)`, { parse_mode: "Markdown" })
            }
        })

        /**
         * Handle callback queries
         */
        Telegram.Bot.on("callback_query", async (ctx) => {
            let user = ctx.callbackQuery.from
            Log.info(`${Lang.bot.callbackQuery.from}: ${user.first_name != "" && user.first_name != undefined ? user.first_name : user.username ? user.username : user.id} [${user.id}] ${Lang.bot.callbackQuery.callback} ${ctx.callbackQuery.data}`)
            let data = await Bot.callbackQueryDistributor(ctx)
            Log.info(`${Lang.bot.callbackQuery.answerto}: ${ctx.callbackQuery.from.id} - ${Lang.bot.callbackQuery.success}`)
        })

        /**
         * Handle inline queries
         */
        Telegram.Bot.on("inline_query", async ctx => {
            let user = ctx.inlineQuery.from
            Log.info(`${Lang.bot.inlineQuery.from}: ${user.first_name != "" && user.first_name != undefined ? user.first_name : user.username ? user.username : user.id} [${ctx.inlineQuery.from.id}] ${Lang.bot.inlineQuery.query}`)
            let data = await Bot.inlineDistributor(ctx)
            if (data != undefined) {
                // Exchange all id of inline result to the system registered id
                data.map(item => {
                    let id = new Array()
                    for (let i = 0; i < 8; i++) {
                        id.push(Math.floor(Math.random() * Math.floor(8)) + 1)
                    }
                    item["id"] = id.join("")
                })
                ctx.answerInlineQuery(data, { cache_time: 10 }).then(res => { Log.info(`${Lang.bot.inlineQuery.answerto}: ${ctx.inlineQuery.from.id} - ${Lang.bot.inlineQuery.success}`) }).catch(err => DiagnosticLog.fatal(err))
            }
            else if (data == undefined) {
                ctx.answerInlineQuery([
                    {
                        type: "article",
                        id: ctx.inlineQuery.id,
                        title: `没有找到你想要的东西呢`,
                        description: "Didn't find what you need",
                        thumb_url: "https://i.loli.net/2019/11/13/dQDxC4Nv91VYK2E.jpg",
                        input_message_content: { message_text: `没有你需要的结果` }
                    }
                ], { cache_time: 1 }).catch(err => DiagnosticLog.fatal(err))
            }
        })

        /**
         * Handle all text like messages
         */
        Telegram.Bot.on("text", async (ctx) => {
            Message.messagectl.log(ctx)

            /**
             * Handle commands
             */
            
            if (/^\/\w+/gui.test(ctx.message.text)) {
                let me = await Telegram.Bot.telegram.getMe()
                if (/^\/\w+@\w+/.test(ctx.message.text) && !ctx.message.text.includes(me.username)) {
                    return
                }
                let data = Bot.staticCommandDistributor(ctx)
                if (data == undefined) {
                    data = await Bot.commandDistributor(ctx)
                }
                if(data != undefined) {
                    ctx.reply(data, { parse_mode: "Markdown" })
                }
            }

            /**
             * Handle general messages
             */
            else {
                let data = await Bot.messasgeDistributor(ctx)
                if (data == undefined) {
                    let noneMsg = await Message.Message.hears(ctx)
                    if (noneMsg == undefined) {
                        Nlp.tag(ctx, ctx.message.text).then(res => {
                            let text = res
                            if (text != undefined) {
                                Core.getKey("nlpAnalyzeIds").then(ids => {
                                    let current = JSON.parse(ids)
                                    current.map(item => {
                                        if (item == ctx.message.from.id) {
                                            Telegram.Bot.telegram.sendMessage(ctx.message.chat.id, text, { parse_mode: "Markdown" }).catch(err => {
                                                DiagnosticLog.fatal(err)
                                            })
                                        }
                                    })
                                })
                            }
                        })
                    }
                }
                else {
                    ctx.replyWithChatAction("typing")
                    ctx.reply(data)
                }  
            }
        }).catch(err => DiagnosticLog(err))

        Telegram.Bot.on("forward", async (ctx) => {
            Log.debug(ctx.message)
        })

        // Log
        Telegram.Bot.catch((err) => {
            DiagnosticLog.fatal(err)
            throw err
        })
    }
}

exports.Core = Core
exports.reload = reload
exports.Control = Control
exports.Message = Message
exports.Command = Command
exports.Telegram = Telegram