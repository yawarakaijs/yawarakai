/**************************************************************************
    
    yawarakai: A running core that support many neural network models which works for NLP or providing solution
    Copyright (C) 2019  Yuna Hanami

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>

 *************************************************************************/

// Dependencies

let Telegraf = require('telegraf');

// Local Packages

let Log = require('./log').Log
let msgLog = require('./log').msgLog
let AnonymousLog = require('./log').AnonymousLog
let Core = require('./core')
let LangCtl = require('./lang').Lang
let config = require('./config.json')
let packageInfo = require('./package.json')

// Core Runtime

let Lang = LangCtl.setLang()
console.log("Yawarakai  Copyright (C) 2019  Yuna Hanami")
console.log("This program comes with ABSOLUTELY NO WARRANTY; for details type `show w'.\nThis is free software, and you are welcome to redistribute it\nunder certain conditions; type `show c' for details.")
Log.info( Lang.app.startTime + "：" + Core.Time.logTime + " - " + config.botname + " " + Lang.app.coreVersion + ": " + packageInfo.version);

// Telegraf

const Bot = new Telegraf(config.token)

// CLI

Core.cliInput('> ', input =>
{
    switch (input)
    {
        default:
            console.log(config.coreName + ": " + input + ": " + Lang.app.cliCommandUnknownPrompt)
            AnonymousLog.trace( Lang.app.commandExecution + ": " + input)
            break;
        case 'telegram start':
            Log.debug("Telegram Bot: " + config.botname + Lang.app.starting)
            Bot.telegram.setWebhook(config.webhook.url)
            Bot.startWebhook('/', null, 8000)
            break;
        case 'help':
            console.log( Lang.app.cliAvailiableCommand + ": telegram | help | exit")
            break;
        case 'exit':
            return false;
        case '':
            break;
    }
});

// Log

Bot.on('text', (ctx) => {

    
    let groupType = "supergroup"
    var isGroup = (isGroup == ctx.message.chat.type);
    
    // Prefix
    
    var output = "来自: ";
    var chatMessage = "消息: " + ctx.message.text;
    var fromChatId = " [ ID:" + ctx.message.from.id + " ]";

    if(ctx.message.from.first_name && ctx.message.from.last_name) {
        if(isGroup) {
            msgLog.log(output + ctx.message.from.first_name + " " + ctx.message.from.last_name + fromChatId)
            msgLog.log(chatMessage);
        }
        else {
            msgLog.log(output + ctx.message.from.first_name + " " + ctx.message.from.last_name + fromChatId)
            msgLog.log(chatMessage);
        }
    }
    else if(ctx.message.from.username) {
        msgLog.log(output + ctx.message.from.username + fromChatId)
        msgLog.log(chatMessage);                
    }
    else {
        msgLog.log(output + fromChatId)
        msgLog.log(chatMessage);
    }
    
    ctx.reply("喵")
})

Bot.catch((err) => {
    Log.fatal(err);  
})