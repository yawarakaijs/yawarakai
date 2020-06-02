// Local Files

let Session = require('../session')
let CbqProcessor = require('./processor/cbqprocessor')

let Control = {
    switcher(context) {
        let ctx = context.ctx
        let callback = context.ctx.update.callback_query

        switch (callback.data) {
            case "tosagree":
                tos.agree(context)
                return true
            case "tosdisagree":
                tos.disagree(context)
                return false
            case "ppagree":
                pp.agree(context)
                return true
            case "ppdisagree":
                pp.disagree(context)
                return false
        }
    },
    count: 0
}

let tos = {
    agree(context) {
        let id = context.ctx.update.callback_query.message.chat.id
        
        Session.User.exist(id, "tosagreement").then(res => {
            if (!res) {
                Session.User.append(id, "tosagreement", true)
            }
            else {
                Session.User.update(id, "tosagreement", true)
            }

            context.telegram.deleteMessage(
                id,
                context.ctx.update.callback_query.message.message_id
            )
            context.telegram.sendMessage(id, "谢谢你w")
            context.telegram.sendMessage(id, pp.pp, {
                parse_mode: "Markdown",
                reply_markup: {
                    inline_keyboard: [[
                        {

                            text: "接受",
                            callback_data: "ppagree"
                        },
                        {
                            text: "拒绝",
                            callback_data: "ppdisagree"
                        }
                    ]]
                },
                disable_web_page_preview: true,
            })
        })
        let user = new Session.UserSession(context.ctx.update.callback_query.from.id)
        return true
    },
    disagree(context) {
        let id = context.ctx.update.callback_query.message.chat.id
        Session.User.exist(id, "tosagreement").then(res => {
            if (!res) {
                Session.User.append(id, "tosagreement", false)
            }
            else {
                Session.User.update(id, "tosagreement", false)
            }

            return false
        })
    }
}

let pp = {
    pp: "欢迎使用，还有一步需要你确认一下呢。\n\n" +
        "本 Bot 使用的消息处理和数据处理会有一些数据分析用于本项目的自然语义处理和情感分析，" +
        "除此以外还会有一些第三方的组件可能会要求使用更多的信息处理内容，在组件使用了非常规的" +
        "数据分析和储存的时候我们会要求组件单独显示一份数据使用许可，也需要你单独允许才行。\n" +
        "在 Bot 范围内，我们不会将你的数据传送给任何第三方网站，也不会使用你的名字，用户名作" +
        "为任何用途，我们使用和存储，分析你的数据，都只会在本地进行处理，或是在 yutsuki.moe " +
        "域名下进行。\n\n" +
        "**但是第三方组件的数据使用和存储，分析并不受限，可能在使用第三方组件的时候可能会有意" +
        "外的对第三方网站的访问。** \n" +
        "**网易云音乐的查询和使用不收集 userid，访问均通过 https://api.yutsuki.moe 进行**\n\n" +
        "如果同意以上内容，将**允许**我们收集和储存，分析你的数据，即便如此我们不会在第三方网" +
        "站上进行操作。部分功能的使用将会提供部分时间，Telegram 用户 ID 给系统作为错误分析。",
    agree(context) {
        let id = context.ctx.update.callback_query.message.chat.id
        Session.User.exist(id, "ppagreement").then(res => {
            if (!res) {
                Session.User.append(id, "ppagreement", true)
            }
            else {
                Session.User.update(id, "ppagreement", true)
            }

            context.telegram.deleteMessage(
                context.ctx.update.callback_query.message.chat.id,
                context.ctx.update.callback_query.message.message_id
            )
            context.telegram.sendMessage(id, "好的呢，所有的数据都存储好了")
        })

        return true
    },
    disagree(context) {
        let id = context.ctx.update.callback_query.message.chat.id
        Session.User.exist(id, "ppagreement").then(res => {
            if (!res) {
                Session.User.append(id, "ppagreement", false)
            }
            else {
                Session.User.update(id, "ppagreement", false)
            }

            context.telegram.deleteMessage(
                context.ctx.update.callback_query.message.chat.id,
                context.ctx.update.callback_query.message.message_id
            )
            context.telegram.sendMessage(id, "好的，我们除去正常的日志以外不会记录任何你的数据")
        })
    }
}

let broadcast = {
    start(context) {

    }
}

module.exports = {
    Control
}