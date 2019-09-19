// Local Packages

let Log = require('../log')
let Lang = require('../lang').Lang
let what2eat = require('./what2eat')

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
        if((ctx.message.from.first_name && ctx.message.from.last_name)) {
            var infoFullId = output + ctx.message.from.first_name + " " + ctx.message.from.last_name + fromChatId
            if(isGroup) {
                Log.msgLog.log(infoFullId +  groupInfo)
                Log.msgLog.log(chatMessage)
            }
            else {
                Log.msgLog.log(infoFullId)
                Log.msgLog.log(chatMessage)
            }
        }
        // Case of User had their FIRSTNAME set only
        else if(ctx.message.from.first_name) {
            var infoNameOnly = output + ctx.message.from.first_name + fromChatId
            if(isGroup) {
                Log.msgLog.log(infoNameOnly + groupInfo)
                Log.msgLog.log(chatMessage)
            }
            else {
                Log.msgLog.log(infoNameOnly)
                Log.msgLog.log(chatMessage)
            }
        }
        // Case of User had their USERNAME set only or perhaps incorrectly set FIRSTNAME in LASTNAME
        else if(ctx.message.from.username) {
            var infoUsernameOnly = output + ctx.message.from.username + fromChatId
            if(isGroup) {
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
            if(isGroup) {
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
    },
    // Trigger set for special trigger
    trigger: (text, ctx) => {
        text
        ctx
    },
    // Send data directly to middleware (Call as Going)
    addTo: (ctx, controller) => {
        var procTypes = (name) => {
            switch(name) {
                default:
                    // Redirect data back to processor see if pairs any Pattern
                    messagectl.process(ctx)
                    break
            }
        }
        // Check if inputed a sets of processors
        if(typeof(controller) != String) {
            for(var i = 0; i < controller.length; i++) {
                procTypes(controller[i])
            }
        }
    },
    // Send data directly to middleware (Call At Time)
    sendTo: (ctx, processor) => {
        var procTypes = (name) => {
            switch(name) {
                default:
                    // Redirect data back to processor see if pairs any Pattern
                    messagectl.process(ctx)
                    break
                case "what2eat":
                    // Send Context to what2eat
                    what2eat()
                    break
            }
        }
        // Check if inputed a sets of processors
        if(typeof(processor) != String) {
            for(var i = 0; i < processor.length; i++) {
                procTypes(processor[i])
            }
        }
        
    }
}

let Message = {
    trigCtl: () => {
        
    },
    hears: (ctx) => {
        
        let loveneko = /^(?!不)(?:喜欢 Neko)|(?:喜欢Neko)/gi
        let loveyuna = /^(?!不)(?:喜欢佑奈)|(?:喜欢佑奈)/gi
        let sadmeow = /(?:喵)(?:\.\.\.)+/g
        let yutsukicute = /(?:悠月)(.*?)(?:可爱)/g
        let yutsukinotcute = /(.*?)(不)(.*?)(?:悠月)|(?:悠月)(.*?)(不)(.*?)/g
        let yutsukiyutsukiyu = /(悠月悠月悠)|(悠月悠)/g
        let yutsukiletsplay = /((?:悠月)|(悠月酱))(?:来玩)/g
        let hugneeded = /(?:要抱)((抱)|(.*))/gi
        let tiredforthis = /(^(.*)(?:累))/gi
        let meowmeow = /(喵~)/gi
        let dumbyouyue = /(悠月)(()|(是))((?:笨蛋)|(?:讨厌)|(?:大笨蛋))/gi
        let hugyouyue = /((?:抱抱)|(?:摸摸))(柠檬)/gi
        let yutsukihi = /悠月|悠月(酱|喵{1,2}|月{1,2})/gi
        let happyemotion = /^开心呢/gi
        let likeu = /^(?:喜欢)|(？:喜欢呢)/gi

        // Greetings

        let scmorning = /((.*)|(?:大家))((?:早安安)|(?:早安)|(?:早上好))/gi
        let yutsukimorning = /((悠月酱)|(?:悠月))((?:早安安)|(?:早安)|(?:早上好)|(?:早))/g
        let enmorning = /((?:Good Morning))(\w|((.*)(?:.*)))/gi

        let scafternoon = /((.*)|(?:大家))((?:午安安)|(?:午安)|(?:下午好)|(?:中午好))/gi
        let yutsukiafternoon = /((悠月酱)|(?:悠月))((?:午安)|(?:午安安)|(?:下午好))/g
        let enafternoon = /((?:Good Afternoon))(\w|((.*)(?:.*)))/gi

        let scnight = /((.*)|(?:大家))((?:晚安安)|(?:晚安))/gi
        let yutsukinight = /((悠月酱)|(?:悠月))((?:晚安)|(?:晚安安))/g
        let ennight = /((?:Good Night))(\w|((.*)(?:.*)))/gi

        let scevening = /((.*)|(?:大家))((?:晚上好)|(?:晚好))/gi
        let yutsukievening = /((悠月酱)|(?:悠月))((?:晚上好)|(?:晚好))/gi
        let enevening = /((?:Good Evening))(\w|((.*)(?:.*)))/gi

        Message.reply(ctx, loveneko, "Neko 知道的话会超开心的！")
        Message.reply(ctx, loveyuna, "佑奈知道的话会超开心的！")
        Message.reply(ctx, sadmeow, "喵...怎么了吗...")
        Message.reply(ctx, /(?:咕噜)/g, "咕噜咕噜咕噜")
        Message.reply(ctx, yutsukinotcute, "喵...悠月做错惹什么嘛...（哭哭")
        Message.reply(ctx, yutsukicute, "啊呜啊呜(捂脸)")
        Message.reply(ctx, yutsukiyutsukiyu, "咕噜咕噜~ 要做什么啦！")
        Message.reply(ctx, yutsukiletsplay, "(竖起耳朵) 悠月也想玩呢，可是佑奈说要继续研究新的东西什么的...弄完这些工作才能玩呢。抱歉啦~")
        Message.reply(ctx, hugneeded, "啊呜啊呜，抱紧紧...（顺毛）")
        Message.reply(ctx, tiredforthis, "揉揉...实在太累的话就休息一下呢喵...")
        Message.reply(ctx, meowmeow, "喵~")
        Message.reply(ctx, dumbyouyue, "呜...悠月对不起呢...有什么对不起你的地方吗......而且...明明是主人的错嘛！")
        Message.reply(ctx, hugyouyue, "喵...扑过去抱住 >_<")
        Message.reply(ctx, yutsukihi, "在的w")
        Message.reply(ctx, happyemotion, "开心就好呢w")
        Message.reply(ctx, likeu, "喜欢 /")

        Message.reply(ctx, yutsukimorning, "喵~早安")
        Message.reply(ctx, scmorning, "早安喔")
        Message.reply(ctx, enmorning, "Morning!")

        Message.reply(ctx, yutsukiafternoon, "咕噜咕噜，午安安，有闲暇时间的话记得休息放松一下呢~")
        Message.reply(ctx, scafternoon, "已经过去大半天了呢，午安喵")
        Message.reply(ctx, enafternoon, "Good afternoon! Finishing up with all your work?")

        Message.reply(ctx, yutsukinight, "嗯喵，晚安。祝你做个好梦呢~")
        Message.reply(ctx, scnight, "晚安喵，好好休息哦")
        Message.reply(ctx, ennight, "Good night! Wish you would have a sweet dream :)")

        Message.reply(ctx, yutsukievening, "喵喵，晚上好喔，悠月在研究新奇的东西呢w")
        Message.reply(ctx, scevening, "晚上好，今天过得怎么样呢？")
        Message.reply(ctx, enevening, "Good evening! How's it going today?")
        
    },
    reply(ctx, textPattern, textReply) {
        if(Message.count >= 1) {
            Message.count = 0;
            return;
        }
        else if(Message.count == 0) {
            if(textPattern.test(ctx.message.text)) {
                Message.count ++;
                ctx.reply(textReply);
                Log.Log.debug(`回复至: ${ctx.message.from.id} - 成功 | 匹配: ${textPattern[Symbol.match](ctx.message.text)}`);
                return;
            }
            else{
                return;
            }
        }
        
    },
    count: 0
}

exports.messagectl = messagectl
exports.Message = Message