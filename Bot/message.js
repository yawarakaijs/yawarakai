// Local Packages

let Log = require('../log')
let Lang = require('../lang').Lang

let messagectl = {

    //Log out the message on Message Log File
    logMsg: (ctx) => {

        let groupType = "supergroup"
        var isGroup = (groupType == ctx.message.chat.type)
    
        // Prefix
    
        var output = Lang.bot.message.from + ": "
        var outputGroup = Lang.bot.message.group
        var chatMessage = Lang.bot.message.text + ": " + ctx.message.text
        var fromChatId = " [ ID:" + ctx.message.from.id + " ]"
        var groupInfo = " | " + outputGroup + ": [ " + ctx.message.chat.title + " ] ID: " + ctx.message.chat.id

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
    }
}

let Message = {

}

exports.messagectl = messagectl
exports.Message = Message