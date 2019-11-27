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

/**
 * @author Hanami Yuna
 * @copyright
 */

// Local Packages

let Log = require('./Core/log').Log
let Lang = require('./Core/lang')
let config = require('./config.json')
let packageInfo = require('./package.json')
let AnonymousLog = require('./Core/log').AnonymousLog

// Core Runtime

try {
    if(!Lang.app.startTime) {
        throw new Error("Application Initialization Error: Invalid locale file")
    }   
}
catch (err) {
    Log.fatal(err)
    Log.info("Application failed to load because of the invalid locale file")
    Log.warning("Please make sure you have the latest locale files downloaded and exist")
    process.exit(1)
}

let startInfo = Lang.app.startTime + "：" + Date() + " - " + config.botname + " " + Lang.app.coreVersion + ": " + packageInfo.version

console.log("Yawarakai  Copyright (C) 2019  Yuna Hanami")
console.log(startInfo)
AnonymousLog.info(startInfo)

// Initilization

let Bot = require('./Core/bot')
let Core = require('./core')
Bot.Control.start()

let args = process.argv.slice(2)

if(args.length != 0) {
    switch(args[0]) {
        case "start":
            if (args.length > 1 && (args[1] == "--debug" || args[1] == "--d")) {
                Core.setKey("logtext", "")
                Bot.Telegram.command("/telegram debug")
                Core.getKey("nlpfeedback").then(res => {
                    Log.debug(`NLP set to ${res}`)
                })
                Core.setKey("nlpAnalyzeIds", "[]")
                Core.getKey("nlpAnalyzeIds").then(res => {
                    Log.trace(`NLP Analyzer List: ${res}`)
                }).catch(err => {
                    Core.setKey("nlpAnalyzeIds", "[]")
                })
            }
            else {
                Core.setKey("logtext", "")
                Bot.Telegram.command("/telegram start")
                Core.getKey("nlpfeedback")
                Core.getKey("nlpAnalyzeIds").catch(err => {
                    Core.setKey("nlpAnalyzeIds", "[]")
                })
            }
            break
    }
}
else {
    // Debug block
    if (config.debugmode) {
        Core.setKey("logtext", "")
        Bot.Telegram.command("/telegram debug")
        Core.getKey("nlpfeedback").then(res => {
            Log.debug(`NLP set to ${res}`)
        })
        Core.getKey("nlpAnalyzeIds").then(res => {
            Log.trace(`NLP Analyzer List: ${res}`)
        }).catch(err => {
            Core.setKey("nlpAnalyzeIds", "[]")
        })
    }
    else {
        Core.setKey("logtext", "")
        Core.getKey("nlpfeedback")
        Core.getKey("nlpAnalyzeIds").catch(err => {
            Core.setKey("nlpAnalyzeIds", "[]")
        })
    }
}

// CLI
Core.cliInput('> ', input => {
    var command = input.split(' ')[0] // Cut Command and set to First string
    var isCommand = command.includes("/") && (command.indexOf("/") == 0) // Check command type
    if (isCommand) {
        switch (command) {
            default:
                console.log(config.coreName + ": " + input + ": " + Lang.app.cliCommandUnknownPrompt)
                AnonymousLog.trace(Lang.app.commandExecution + ": " + input)
                break
            case '/telegram':
                Bot.Telegram.command(input)
                break
            case '/help':
                console.log(Lang.app.cliAvailiableCommand + ": /telegram | /help | /[exit|stop]")
                break
            case '/stop':
            case '/exit':
                return false;
        }
    }
    else { // Basic session processing and exception handling
        switch (input) {
            default:
                break
            case '':
                break
        }
    }
})