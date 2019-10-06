// Local Packages

let Log = require('../log')
let Core = require('../core')
let Lang = require('../lang').Lang
let nodejieba = require('nodejieba')
let Bayes = require('zh-classify').Bayes

let messagectl = {

    //Log out the message on Message Log File
    logMsg: (ctx) => {

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
    },
    // Process Context Data
    process: (ctx) => {
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
    async hears(ctx) {
        let meowmeow = /(喵～)/gui
        let startnlp = /((悠月，)|())打开分析模式/gui
        let stopnlp = /关闭分析模式/gui
        await Message.replyWithPattern(ctx, meowmeow, ["喵~"])
        await Message.replyWithPattern(ctx, startnlp, ["好的", "接下来乃说的话都可以得到一个 NLP 的分析"])
        await Message.replyWithPattern(ctx, stopnlp, ["关闭了呢"])
    },
    async replyWithPattern(ctx, textPattern, textReply, extra) {
        if (Message.count == 0 && textPattern.test(ctx.message.text)) {
            Message.count++
            if (/((悠月，)|())打开分析模式/gui.test(ctx.message.text)) {
                NlpControl.start()
            }
            if (/关闭分析模式/gui.test(ctx.message.text)) {
                NlpControl.stop()
            }
            for (let i of textReply) {
                ctx.replyWithChatAction("typing")
                setTimeout(() => {
                    ctx.reply(i).then(res => {
                        Log.Log.debug(`回复至: ${ctx.message.from.id} - 成功 | 匹配: ${textPattern[Symbol.match](ctx.message.text)}`)
                    }).catch(err => {
                        Log.Log.fatal(err)
                    })
                    this.todo(ctx, i.length)
                }, i.length * 200)
            }
        }
        Message.count = Message.count >= 1 ? 0 : Message.count
        return
    },
    todo(ctx, length) {
        let thetimer = length * 200
        ctx.replyWithChatAction("typing")
    },
    async reply(ctx, textReply, extra) {
        if (Message.count == 0) {
            Message.count++
            for (let i of textReply) {
                ctx.replyWithChatAction("typing")
                setTimeout(() => {
                    ctx.reply(textReply).then(res => {
                        Log.Log.debug(`回复至: ${ctx.message.from.id} - 成功`)
                    }).catch(err => {
                        Log.Log.fatal(err)
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

let Nlp = {
    tag: async (ctx, text) => {
        return await Core.getKey("nlpfeedback").then(res => {
            let status = JSON.parse(res)
            if (status) {
                let stepone = nodejieba.tag(text)
                const sentiment = new Bayes()
                let senti = sentiment.clf(text)

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
                            let result = "( " + tagTypes[types[i]] + " " + tag + ". )"
                            let tagData = `${word}${result}`
                            steptwo.push(tagData)
                        }
                    }
                }

                let plainText = JSON.stringify(steptwo)
                let newText = plainText.replace(/"/g, " ")
                newText = newText.replace(/'/g, "")
                newText = newText.replace(/\[/g, "")
                newText = newText.replace(/\]/g, "")
                newText = newText.slice(1)
                let data = "原句: " + text + "\n \n" + newText + "\n \n" + `负面： ${senti.neg} \n正面： ${senti.pos}`

                Log.Log.debug(`User[${ctx.message.from.id}] NLP Data: ${steptwo}`)
                return data
            }
        })
    }
}

let NlpControl = {
    start: () => {
        Core.setKey("nlpfeedback", true)
        Core.getKey("nlpfeedback").then(res => {
            Log.Log.debug(`NLP set to ${res} [OK]`)
        })
    },
    stop: () => {
        Core.setKey("nlpfeedback", false)
        Core.getKey("nlpfeedback").then(res => {
            Log.Log.debug(`NLP set to ${res} [OK]`)
        })
    }
}

exports.Nlp = Nlp
exports.messagectl = messagectl
exports.Message = Message

/*


 */