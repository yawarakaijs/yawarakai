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
let Store = require('./Core/storage')
let config = require('./config.json')
let Component = require('./component')
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

Store.init()

// Initilization

let Bot = require('./Core/bot')
let Core = require('./core')
Bot.Control.start()

let args = process.argv.slice(2)

if(args.length != 0) {
    switch(args[0]) {
        case "start":
            if (args.length > 1 && (args[1] == "--debug" || args[1] == "--d")) {
                Bot.Telegram.command("/telegram debug")
                Store.find({key: "nlpfeedback"}).then(res => {
                    Log.debug(`NLP set to ${res[0].nlpfeedback}`)
                }).catch(err => {
                    Store.insert({nlpfeedback: false, key: "nlpfeedback"})
                })
                Store.find({ key: "nlpAnalyzeIds" }).then(res => {
                    Log.trace(`NLP Analyzer List: ${res[0].nlpAnalyzeIds}`)
                }).catch(err => {
                    Store.insert({nlpAnalyzeIds: "[]", key: "nlpAnalyzeIds"})
                })
            }
            else {
                Bot.Telegram.command("/telegram start")
                Store.find({key: "nlpAnalyzeIds"}).catch(err => {
                    Store.insert({nlpAnalyzeIds: "[]", key: "nlpAnalyzeIds"})
                })
            }
            break
    }
}
else {
    // Debug block
    if (config.debugmode) {
        Bot.Telegram.command("/telegram debug")
        Store.find({key: "nlpfeedback"}).then(res => {
            Log.debug(`NLP set to ${res[0].nlpfeedback}`)
        }).catch(err => {
            Store.insert({nlpfeedback: false, key: "nlpfeedback"})
        })
        Store.find({ key: "nlpAnalyzeIds" }).then(res => {
            Log.trace(`NLP Analyzer List: ${res[0].nlpAnalyzeIds}`)
        }).catch(err => {
            Store.insert({nlpAnalyzeIds: "[]", key: "nlpAnalyzeIds"})
        })
    }
    else {
        Store.find({key: "nlpAnalyzeIds"}).catch(err => {
            Store.insert({nlpAnalyzeIds: "[]", key: "nlpAnalyzeIds"})
        })
    }
}

function commandParse (input) {
    let commandArgs = input.split(" ")
    let command = commandArgs[0].substring(1)
    command = command.replace(/@\w+/g, "")
    let args = []
    commandArgs.forEach((value, index) => {
        if (index > 0 && value !== "") {
            args.push(value)
        }
    })
    return {
        cmd: command,
        args: args
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
            case '/reload':
                Bot.reload()
                break
            case '/unload':
                let unloadArgs = commandParse(input).args
                
                break
            case '/compo':
                let compoArgs = commandParse(input).args
                if (args[0] == "list" || "--list" || "--l") {
                    console.log(Component.Register.list().list.join("\n"))
                }
                else {
                    console.log(Lang.app.cliCommandUnknownPrompt)
                }
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