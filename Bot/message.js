// Local Packages

let Log = require('../log')
let Lang = require('../lang').Lang


let messagectl = {
    logMsg: (ctx) => {

    let groupType = "supergroup"
    var isGroup = (groupType == ctx.message.chat.type)
    
    // Prefix
    
    var output = Lang.bot.message.from + ": "
    var chatMessage = Lang.bot.message.text + ": " + ctx.message.text
    var fromChatId = " [ ID:" + ctx.message.from.id + " ]"

    console.log(ctx.message)

    if((ctx.message.from.first_name && ctx.message.from.last_name)) {
        if(isGroup) {
            Log.msgLog.log(output + ctx.message.from.first_name + " " + ctx.message.from.last_name + fromChatId)
            Log.msgLog.log(chatMessage)
        }
        else {
            Log.msgLog.log(output + ctx.message.from.first_name + " " + ctx.message.from.last_name + fromChatId)
            Log.msgLog.log(chatMessage)
        }
    }
    else if(ctx.message.from.first_name) {
        if(isGroup) {
            Log.msgLog.log(output + ctx.message.from.first_name + fromChatId)
            Log.msgLog.log(chatMessage)
        }
        else {
            Log.msgLog.log(output + ctx.message.from.first_name + fromChatId)
            Log.msgLog.log(chatMessage)
        }
    }
    else if(ctx.message.from.username) {
        if(isGroup) {
            Log.msgLog.log(output + ctx.message.from.username + fromChatId)
            Log.msgLog.log(chatMessage)
        }
        else {
            Log.msgLog.log(output + ctx.message.from.username + fromChatId)
            Log.msgLog.log(chatMessage)
        }
    }
    else {
        if(isGroup) {
            Log.msgLog.log(output + fromChatId)
            Log.msgLog.log(chatMessage)
        }
        else {
            Log.msgLog.log(output + fromChatId)
            Log.msgLog.log(chatMessage)
        }
    }
    }
}

let Message = {

}

exports.messagectl = messagectl
exports.Message = Message