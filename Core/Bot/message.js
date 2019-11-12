// Dependencies

// Local Packages

let Log = require('../log')
let Lang = require('../lang').Lang
let NlpControl = require('./nlp').NlpControl
let MessageDictionary = require('./msgprocessor').MessageDictionary
let MessageDictionaryControl = require('./msgprocessor').MessageDictionaryControl

let messagectl = {

    //Log out the message on Message Log File
    log: (ctx) => {

        let groupType = "supergroup"
        var isGroup = (groupType == ctx.message.chat.type)

        // Prefix
        var output = `${Lang.bot.message.from}: `
        var chatMessage = `: ${ctx.message.text}`
        var fromChatId = ` [${ctx.message.from.id}]`
        var groupInfo = ` | ${Lang.bot.message.group}: ${ctx.message.chat.title} [${ctx.message.chat.id}]`

        // Case of User had their FIRSTNAME and LAST NAME set
        if ((ctx.message.from.first_name && ctx.message.from.last_name)) {
            var infoFullId = output + ctx.message.from.first_name + " " + ctx.message.from.last_name + fromChatId
            if (isGroup) {
                Log.msgLog.log(infoFullId + groupInfo + chatMessage)
            }
            else {
                Log.msgLog.log(infoFullId + chatMessage)
            }
        }
        // Case of User had their FIRSTNAME set only
        else if (ctx.message.from.first_name) {
            var infoNameOnly = output + ctx.message.from.first_name + fromChatId
            if (isGroup) {
                Log.msgLog.log(infoNameOnly + groupInfo + chatMessage)
            }
            else {
                Log.msgLog.log(infoNameOnly + chatMessage)
            }
        }
        // Case of User had their USERNAME set only or perhaps incorrectly set FIRSTNAME in LASTNAME
        else if (ctx.message.from.username) {
            var infoUsernameOnly = output + ctx.message.from.username + fromChatId
            if (isGroup) {
                Log.msgLog.log(infoUsernameOnly + groupInfo)
                Log.msgLog.log(chatMessage)
            }
            else {
                Log.msgLog.log(infoUsernameOnly)
                Log.msgLog.log(chatMessage)
            }
        }
        // Case of User only have ID could be provided or perhaps incorrectly set FIRSTNAME in LASTNAME or forgot to set username with above
        else {
            if (isGroup) {
                Log.msgLog.log(output + fromChatId + groupInfo)
                Log.msgLog.log(chatMessage)
            }
            else {
                Log.msgLog.log(output + fromChatId)
                Log.msgLog.log(chatMessage)
            }
        }
        return
    }
}

let Message = {
    async hears(ctx) {

        let meowmeow = new MessageDictionary(
            [{reg: "(喵～)|(喵~)", mode: "gui"}],
            ["喵～"]
        ).push()

        let startnlp = new MessageDictionary(
            [{reg: "((悠月，)|())打开分析模式", mode: "gui"}],
            ["好的", "接下来乃说的话都可以得到一个 NLP 的分析"],
            [NlpControl.analyzeModeMan],
            true,
            [[ctx.from.id, "add"]]
        ).push()
        
        let stopnlp = new MessageDictionary(
            [{reg: "((悠月)|())关闭分析模式", mode: "gui"}],
            ["关闭了呢"],
            [NlpControl.analyzeModeMan],
            true,
            [[ctx.from.id, "remove"]]
        ).push()

        let matchResult = MessageDictionaryControl.tryMatch(ctx.message.text)
        if(matchResult.reply.length != 0) {
            this.reply(ctx, matchResult)
        }
        if(matchResult.hasFunc) {
            MessageDictionaryControl.callFunc(matchResult)
        }
    },
    todo(ctx, length) {
        let thetimer = length * 200
        ctx.replyWithChatAction("typing")
    },
    //ctx, textReply, extra
    async reply(ctx, context) {
        let textReply = context.reply
        if (Message.count == 0) {
            Message.count++
            for (let i of textReply) {
                ctx.replyWithChatAction("typing")
                setTimeout(() => {
                    ctx.reply(i).then(res => {
                        Log.Log.debug(`${Lang.bot.message.replyto}: ${ctx.message.from.id} - ${Lang.bot.message.success}`)
                    }).catch(err => {
                        Log.DiagnosticLog.fatal(err)
                    })
                    this.todo(ctx, i.length)
                }, i.length * 200)
            }
            ctx.replyWithChatAction("typing")
        }
        Message.count = Message.count >= 1 ? 0 : Message.count
        return
    },
    count: 0
}

exports.messagectl = messagectl
exports.Message = Message