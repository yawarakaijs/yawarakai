/**
 * Mood Journal - Yawarakai Component
 * @author HanamiYuna
 * @copyright 2020
 * 
 * 这个组建的目的是为了让用户能够存储和登记他们的情绪状态和心理状态
 * 为了保证能够在任何情况下都能够完成记录，我们设置了七个不同的情绪
 * 喜怒哀乐忧恨怕
 * 
 * /emotelog <= entering scene emotelog
 * 请选择比较适合你的状态 <= sendMessage
 * inline_keyboard_markup: emoji emoji emoji emoji emoji none
 * map on base to 0 1 2 3 4
 * [user choice] <= redirect to scene emotelog
 * 
 * if(none) {
 *     请选择你现在比较准确的舒适程度
 *     inline_keyboard_markup: -4 -3 -2 -1 0 1 2 3 4
 *     map on weight to 1 2 3 4 5 6 7 8 9
 * }
 * else {
 *     
 *     还有什么其他需要添加的吗？
 * }
 * 
 * 悠月本身的目的是为了能够处理每一个用户的情绪并且建立一个模型，在这样的情况下，
 * 情绪计算本身所需要的 tag 系统就来自用户们所提交的数据，
 */

// Dependecies

let Compo = require('../../component')

// Component Method

let config = require('./config.json')

// Guidelines

// Main

let callbackQuery = {
    mlogStart(context) {
        context.telegram.deleteMessage(context.ctx.update.callback_query.message.chat.id, context.ctx.update.callback_query.message.message_id)
        context.telegram.sendMessage(context.ctx.update.callback_query.message.chat.id, "请选择比较适合你的状态", {
            reply_markup: {
                inline_keyboard: [[
                    {
                        text: "😍",
                        callback_data: "moodjournal:inlove"
                    },
                    {
                        text: "🤣",
                        callback_data: "moodjournal:veryhappy"
                    },
                    {
                        text: "😄",
                        callback_data: "moodjournal:happy"
                    },
                    {
                        text: "😊",
                        callback_data: "moodjournal:quitehappy"
                    },
                    {
                        text: "😐",
                        callback_data: "moodjournal:normal"
                    },
                    {
                        text: "😣",
                        callback_data: "moodjournal:kindlysad"
                    },
                    {
                        text: "😭",
                        callback_data: "moodjournal:crying"
                    },
                    {
                        text: "🤮",
                        callback_data: "moodjournal:feelsbad"
                    },
                    {
                        text: "😡",
                        callback_data: "moodjournal:angry"
                    }

                ]]
            }
        })
    }
}

exports.meta = config.components.moodJournal

// Inner

exports.commands = {
    async mlog(context) {
        Compo.Interface.Session.User.isFirst(context.ctx.message.from.id, "moodjournal").then(res => {
            if (res) {
                let tos = "欢迎使用心情日志。\n" +
                    "以下是免责声明和使用须知：\n" +
                    "该服务来源于官方组件，在使用的过程中我们所提供的分析数据并不代表实际情绪。\n" +
                    "我们提供的数据也不能代表您的真实心理健康状况，如果有任何不适或是感到**绝望" +
                    "**、**抑郁**、甚至是**精神状态恍惚**，我们建议您立即寻求心理咨询和治疗，" +
                    "如果有任何的自倾向，或是即将这么做的话，我们可以提供一部分援助，也可以自愿" +
                    "拨北京心理危机研究和预防中心的电话 `010-82951332`\n\n" +
                    "使用本 Bot 所提供的服务所造成的影响和伤害，我们不承担，但是如果有任何的心" +
                    "理障碍，我们一定会尽力协助您寻找心理治疗渠道\n\n" +
                    "接受上面的条款代表**您**已知悉并且允许我们**存储**和帮助您**处理**、**分" +
                    "析**您的**情感数据**和过程中发生的**聊天内容**"

                this.telegram.sendMessage(context.ctx.message.from.id, tos, {
                    reply_markup: {
                        inline_keyboard: [[
                            {
                                text: "接受",
                                callback_data: "moodjournal:tosagree"
                            }
                        ]]
                    },
                    parse_mode: "Markdown"
                })
            }
            else {
                this.telegram.sendMessage(context.ctx.message.from.id, "菜单：")
            }
        })
    }
}

exports.inlines = {
    async main() {

    }
}

exports.messages = {
    async main() {

    }
}

exports.callbackQuery = {
    async main(ctx) {

        if (!ctx.update.callback_query.data.startsWith("moodjournal")) {
            return undefined
        }
        else {
            let id = ctx.update.callback_query.message.chat.id
            let data = ctx.update.callback_query.data

            data = data.replace(/moodjournal:/, "")
            context = { telegram: this.telegram, ctx: ctx }

            switch (data) {
                case "tosagree":
                    Compo.Interface.Session.User.exist(id, "tosagreement", "moodjournal").then(res => {
                        if (res) {
                            Compo.Interface.Session.User.update(id, "tosagreement", true, "moodjournal")
                        }
                        else {
                            Compo.Interface.Session.User.append(id, "tosagreement", true, "moodjournal")
                        }
                    })
                    callbackQuery.mlogStart(context)
                    break
                default:
                    this.telegram.sendMessage(id, ctx.update.callback_query.message.text)
            }
        }
    }
}

exports.channelPost = {
    async main() {

    }
}

exports.scenes = {
    async main() {

    }
}

// Register

exports.register = {
    // As the example to Yawarakai Compos
    commands: [
        {
            function: "mlog"
        }
    ],
    inlines: [
        {
            // function: "main"
        }
    ],
    messages: [
        // {
        // function: 'main'
        // }
    ],
    callbackQuery: [
        {
            function: 'main'
        }
    ],
    channelPost: [
        // {
        //     function: 'main'
        // }
    ],
    scenes: [
        // {
        //     name: "emote",
        //     function: functionName
        // }
    ],
    permission: [

    ]
}