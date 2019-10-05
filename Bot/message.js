// Local Packages

let Log = require('../log')
let Core = require('../core')
let Lang = require('../lang').Lang
let nodejieba = require('nodejieba')

let messagectl = {

    //Log out the message on Message Log File
    logMsg: (ctx) => {

        let groupType = "supergroup"
        var isGroup = (groupType == ctx.message.chat.type)

        // Prefix
        var output = `${Lang.bot.message.from}: `
        var outputGroup = Lang.bot.message.group
        var chatMessage = `${Lang.bot.message.text} : ${ctx.message.text}`
        var fromChatId = ` [ ID: ${ctx.message.from.id} ]`
        var groupInfo = ` | ${outputGroup} : [ ${ctx.message.chat.title} ] ID: ${ctx.message.chat.id}`

        // Case of User had their FIRSTNAME and LAST NAME set
        if ((ctx.message.from.first_name && ctx.message.from.last_name)) {
            var infoFullId = output + ctx.message.from.first_name + " " + ctx.message.from.last_name + fromChatId
            if (isGroup) {
                Log.msgLog.log(infoFullId + groupInfo)
                Log.msgLog.log(chatMessage)
            }
            else {
                Log.msgLog.log(infoFullId)
                Log.msgLog.log(chatMessage)
            }
        }
        // Case of User had their FIRSTNAME set only
        else if (ctx.message.from.first_name) {
            var infoNameOnly = output + ctx.message.from.first_name + fromChatId
            if (isGroup) {
                Log.msgLog.log(infoNameOnly + groupInfo)
                Log.msgLog.log(chatMessage)
            }
            else {
                Log.msgLog.log(infoNameOnly)
                Log.msgLog.log(chatMessage)
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
    },
    // Process Context Data
    process: (ctx) => {
        Message.hears(ctx)
        let data = Nlp.tag(ctx.message.text)
        Nlp.reply(ctx, data)
    },
    // Trigger set for special trigger
    trigger: (text, ctx) => {
        text
        ctx
    },
    // Send data directly to middleware (Call as Going)
    addTo: (ctx, controller) => {
        var procTypes = (name) => {
            switch (name) {
                default:
                    // Redirect data back to processor see if pairs any Pattern
                    messagectl.process(ctx)
                    break
            }
        }
        // Check if inputed a sets of processors
        if (typeof (controller) != String) {
            for (var i = 0; i < controller.length; i++) {
                procTypes(controller[i])
            }
        }
    },
    // Send data directly to middleware (Call At Time)
    sendTo: (ctx, processor) => {
        var procTypes = (name) => {
            switch (name) {
                default:
                    // Redirect data back to processor see if pairs any Pattern
                    messagectl.process(ctx)
                    break
            }
        }
        // Check if inputed a sets of processors
        if (typeof (processor) != String) {
            for (var i = 0; i < processor.length; i++) {
                procTypes(processor[i])
            }
        }

    }
}

let Message = {
    hears: (ctx) => {
        let meowmeow = /(喵～)/gui
        let startnlp = /((悠月，)|())打开分析模式/gui
        let stopnlp = /关闭分析模式/gui
        Message.reply(ctx, meowmeow, ["喵~"])
        Message.reply(ctx, startnlp, ["好的", "接下来乃说的话都可以得到一个 NLP 的分析"], Nlp.start())
        Message.reply(ctx, stopnlp, ["关闭了呢"], Nlp.stop())
    },
    reply(ctx, textPattern, textReply, extra) {
        if (Message.count == 0 && textPattern.test(ctx.message.text)) {
            Message.count++
            textReply.forEach(element => {
                //ctx.replyWithChatAction(ctx.message.chat.id, "typing")
                ctx.reply(element).then(res => {
                    Log.Log.debug(`回复至: ${ctx.message.from.id} - 成功 | 匹配: ${textPattern[Symbol.match](ctx.message.text)}`)
                })
            })
        }
        Message.count = Message.count >= 1 ? 0 : Message.count
        return
    },
    count: 0
}

let Nlp = {
    reply: (ctx, result) => {
        ctx.reply(result)
    },
    on: false,
    start: () => {
        this.on = true
    },
    stop: () => {
        this.on = false
    },
    tag: (text) => {
        if (this.on) {
            let stepone = nodejieba.tag(text)

            // References to the following websites
            // ICTCLAS 汉语词性标注集 https://www.cnblogs.com/chenbjin/p/4341930.html
            // 汉语分词标准汇总 https://blog.csdn.net/baobao3456810/article/details/53490067
            // 中科院ICTCLAS分词汉语词性标记集 https://blog.csdn.net/u010454729/article/details/40045815

            // Types of tags
            let tagTypes = {
                Ag: "形语素", a: "形容词", ad: "副形词", an: "名形词",
                b: "区别词", c: "连词", Dg: "副语素", d: "副词",
                e: "叹词", f: "方位词", g: "语素", h: "前接成分",
                i: "成语", j: "简称略语", k: "后接成分", l: "习用语",
                m: "数词", Ng: "名语素", n: "名词", nr: "人名",
                ns: "地名", nt: "机构团体", nz: "其他专名", o: "拟声词",
                p: "介词", q: "量词", r: "代词", s: "处所词",
                Tg: "时语素", t: "时间词", u: "助词", Vg: "动语素",
                v: "动词", vd: "副动词", vn: "名动词", w: "标点符号",
                x: "非语素字", y: "语气词", z: "状态词",
            }

            let steptwo = []
            for (let i = 0; i < stepone.length; i++) {
                let wordobj = stepone[i]
                let word = wordobj.word
                let tag = wordobj.tag
                let types = Object.keys(tagTypes)
                for (let i = 0; i < types.length; i++) {
                    if (types[i] === tag) {
                        tag.concat(" ", tagTypes[types[i]])
                        let tagData = `${word} | ${tag}`
                        steptwo.push(tagData)
                    }
                }
            }
            let num = stepone.length >= 5 ? 5 : stepone.length
            let stepthree = nodejieba.extractWithWords(nodejieba.tagWordsToStr(stepone), num)
            return [steptwo]
        }
    }
}

exports.Nlp = Nlp
exports.messagectl = messagectl
exports.Message = Message

/*


 */