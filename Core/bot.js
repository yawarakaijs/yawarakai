// Dependencies

// Local Files

let Core = require('../core')
let Store = require('./storage')
let Scene = require('./Bot/scene')
let Message = require('./Bot/message')
let Session = require('./session')
let Command = require('./Bot/command').Command
let Telegram = require('./Bot/telegram')
let Component = require('../component')
let CallbackQuery = require('./Bot/callbackquery')
let SceneControl = require('./Bot/processor/sceneprocessor').SceneControl

let config = require('../config.json')

// Bot Method

let Nlp = require('./Bot/nlp').Nlp
let Log = require('../Core/log').Log
let Lang = require('./lang')
let DiagnosticLog = require('./Bot/diagnosticlog')

function reload() {
    delete require.cache[require.resolve('../component')]
    Component = require('../component')
    Component.Register.load()
}

Component.Register.load()

let Bot = {
    telegram: Telegram.Bot.telegram,
    DiagnosticLog: DiagnosticLog,
    commandParse(ctx) {
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
    async inlineDistributor(ctx) {
        let method = Component.Compo.inline
        let detail = new Array()
        let result = new Array()

        for (let i of method) {
            try {
                const res = await i.instance.call(this, ctx)
                if (res != undefined) {
                    detail.push(res)
                }
            }
            catch (err) {
                DiagnosticLog.fatal(err)
            }
        }
        if (detail.length == 1 || detail.length >= 2) {
            detail.map(resArray => { resArray.map(item => result.push(item)) })
            return result
        }
        else { return undefined }
    },
    async callbackQueryDistributor(ctx) {
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
    async commandDistributor(ctx) {
        let result = Bot.commandParse(ctx)
        let cmd = Component.Compo.command.find(command => {
            return command.function === result.cmd
        })
        if (!cmd) { return undefined }
        return await cmd.instance.call(this, result)
    },
    staticCommandDistributor(ctx) {
        let result = Bot.commandParse(ctx)
        let data = Command.switcher(result)
        if (data != undefined) {
            return data
        }
        else {
            return undefined
        }
    },
    async messasgeDistributor(ctx) {
        let method = Component.Compo.message
        ctx.message.text = ctx.message.text.replace(/@\w+/g, "")
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
    },
    async sceneDistributor(context) {
        let sce = Component.Compo.scene.find(scene => {
            return scene.name === SceneControl.scene(context.ctx.message.from.id)
        })
        if (!sce) { return undefined }
        return await sce.function.call(this, context)
    }
}

let Control = {
    start() {

        /**
         * Handle new chat member
         */
        Telegram.Bot.on("new_chat_members", async (ctx) => {
            let newMember = ctx.update.message.new_chat_member
            if (!ctx.update.message.new_chat_member.is_bot && config.debugmode) {
                let name = newMember.first_name != "" && newMember.first_name != undefined ? newMember.first_name : newMember.username ? newMember.username : newMember.id
                Telegram.Bot.telegram.sendMessage(ctx.message.chat.id, `欢迎新朋友 [${name}](tg://user?id=${newMember.id}) !\n如果是第一次来到乐园的话，建议和大家自我介绍一下哦（当然也不会勉强了啦）\n希望乃在花見乐园能够玩的开心呢)`, { parse_mode: "Markdown" })
            }
        })

        /**
         * Handle new channel post
         */
        Telegram.Bot.on("channel_post", async (ctx) => {
        })

        /**
         * Handle callback queries
         */
        Telegram.Bot.on("callback_query", async (ctx) => {
            let user = ctx.callbackQuery.from
            Log.info(`${Lang.bot.callbackQuery.from}: ${user.first_name != "" && user.first_name != undefined ? user.first_name : user.username ? user.username : user.id} [${user.id}] ${Lang.bot.callbackQuery.callback} ${ctx.callbackQuery.data}`)

            let context = { telegram: Telegram.Bot.telegram, ctx: ctx }

            let data = CallbackQuery.Control.switcher(context)
            if (!data) {
                data = await Bot.callbackQueryDistributor(ctx)
            }
            Log.info(`${Lang.bot.callbackQuery.answerto}: ${ctx.callbackQuery.from.id} - ${Lang.bot.callbackQuery.success}`)
        })

        /**
         * Handle inline queries
         */
        Telegram.Bot.on("inline_query", async (ctx) => {
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

            let user
            let me = await Telegram.Bot.telegram.getMe()
            let botname = config.botname != "" ? config.botname : me.first_name

            let isFirst = await Session.User.isFirst(ctx.message.from.id)

            if (isFirst) {
                user = new Session.UserSession(ctx.message.from.id)

                let tos = `感谢你选择使用${botname}！` + "\n\n" +
                    "真的很抱歉打扰你的使用，为了你的数据安全和我的法律责任，必须声明一" +
                    "些注意事项，也需要你同意之后才能正常使用全部的功能。\n" +
                    "本 Bot 使用的开源项目位于 https://github.com/hanamiyuna/yawarakai\n\n" +
                    `以下称为 **本 Bot** 的内容均等同于描述本 Telegram Bot **@${me.username}**\n\n` +
                    "使用本 Bot 提供的功能和服务所造成的一切对现实世界所产生的后果，本 Bot 和开发者不负责，" +
                    "因为使用了不同的组件，部分功能可能来源于第三方开发者，所产生的数据和流量，以及个人信息数" +
                    "据信息的使用和记录方法应该是被你所知悉和理解的。\n\n" +
                    "使用本 Bot 的功能代表了你已经知悉你的数据源可能会有以下误差：\n" +
                    "1. 查询的数据和回复可能不会来源我们开发者认证的数据\n" +
                    "2. 查询的数据和回复所描述的时间和地点可能不是准确有效的\n" +
                    "3. 查询的数据和回复过程中产生的信息使用可能会因为第三方组件而泄漏\n" +
                    "4. 在使用了第三方组件的时候，可能会有意外的个人信息使用和记录，这些数据本 Bot 并不负责\n" +
                    "我们在提供服务的过程中不会造成计划打扰，但是有额外的大数据分析可能会产生\n\n" +
                    "即便如此，你也可以拒绝我们进行数据访问。\n" +
                    "**如果你同意以上的内容，可以选择接受以继续**"

                Telegram.Bot.telegram.sendMessage(ctx.message.from.id, tos,
                    {
                        reply_to_message_id: ctx.message.message_id,
                        parse_mode: "Markdown",
                        reply_markup: {
                            inline_keyboard: [[
                                {
                                    text: "接受",
                                    callback_data: "tosagree"
                                }
                            ]]
                        },
                        disable_web_page_preview: true
                    })
            }
            else {
                
                Message.messagectl.log(ctx)

                /**
                 * Handle commands
                 */

                if (/^\/\w+/gui.test(ctx.message.text)) {
                    if (/^\/\w+@\w+/.test(ctx.message.text) && !ctx.message.text.includes(me.username)) {
                        return
                    }
                    let data = Bot.staticCommandDistributor(ctx)
                    if (data == undefined) {
                        data = await Bot.commandDistributor(ctx)
                    }
                    if (data != undefined) {
                        ctx.reply(data, { reply_to_message_id: ctx.message.message_id, parse_mode: "Markdown" })
                    }
                }

                /**
                 * Handle general messages
                 */
                else {
                    // if userid is in scene go to scene
                    // otherwise forbidden
                    if (SceneControl.has(ctx.message.from.id)) {
                        let context = { ctx: ctx, telegram: Telegram.Bot.telegram }
                        Log.debug(`@${ctx.message.from.username} [${ctx.message.from.id}] in scene: ${SceneControl.scene(ctx.message.from.id)}`)
                        let sceData = Scene.switcher(context, SceneControl.scene(ctx.message.from.id))
                        if (!sceData) {
                            Bot.sceneDistributor(context)
                        }
                    }
                    else {
                        let data = await Bot.messasgeDistributor(ctx)
                        if (data == undefined) {
                            let noneMsg = await Message.Message.hears(ctx)
                            if (noneMsg == undefined) {
                                Nlp.tag(ctx, ctx.message.text).then(res => {
                                    let text = res
                                    if (text != undefined) {
                                        Store.find({ key: "nlpAnalyzeIds" }).then(ids => {
                                            let current = JSON.parse(ids[0].nlpAnalyzeIds)
                                            current.map(item => {
                                                if (item == ctx.message.from.id) {
                                                    Telegram.Bot.telegram.sendMessage(ctx.message.chat.id, text, { reply_to_message_id: ctx.message.message_id, parse_mode: "Markdown" }).catch(err => {
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
                            ctx.reply(data, { reply_to_message_id: ctx.message.message_id })
                        }
                    }
                }
            }
        }).catch(err => DiagnosticLog(err))

        Telegram.Bot.on("forward", async (ctx) => {

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