// Dependencies



// Local Packages

let Lang = require('../lang')
let config = require('../../config.json')
let packageInfo = require('../../package.json')
let Component = require('../../component')

// Main

let Command = {
    switcher: function (context) {
        switch(context.cmd) {
            case "help":
                let basics = Lang.bot.command.help + "\n\n" + Lang.bot.command.start + "\n" + Lang.bot.command.info + "\n" + Lang.bot.command.settings + "\n"
                return basics + "\n" + Component.compoHelp.join("\n")
            case "start":
                return "你好哦，感谢使用呢。如果不知道怎么使用的话，可以使用 /help 查阅相关的帮助信息"
            case "info":
                let info = this.info(context)
                return info
            case "settings":
                return "暂时不可用呢。"
            default:
                return undefined
        }
    },
    info: function (context) {

        let ctx = context.ctx
        let hasName = ctx.message.from.first_name != undefined || ctx.message.from.first_name != ""
        let hasLast = ctx.message.from.last_name != undefined || ctx.message.from.last_name != ""
        let user = hasName ? hasLast ? `${ctx.message.from.first_name} ${ctx.message.from.last_name}` : `${ctx.message.from.first_name}` : ""
        let string = `Current\n${config.botname} v${packageInfo.version}\n`
        let pairs = Component.compoPair.join("\n")
        let chat = ctx.message.chat.type != "private" ? `\nChat ${ctx.message.chat.title} [${ctx.message.chat.id}]\n` : "\n"
        string = string + `User ${user} <${ctx.message.from.id}>${chat}`
        string = string + pairs

        return string
    }
}

exports.Command = Command