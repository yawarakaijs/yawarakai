// Dependencies

let log4js = require('log4js')

// Local Packages

let Core = require('../core')
let Bot = require('../Core/bot').Telegram.Bot
let config = require('../config.json')

let coreLogFileName = "./log/" + config.botname + "-" + "Core-Log" + "-" + Core.Time.logTime + ".log"
let messageLogFileName = "./log/" + config.botname + "-" + "Message-Log" + "-" + Core.Time.logTime + ".log"

log4js.configure({
    appenders: {
        Core: { type: 'file', filename: coreLogFileName },
        MessageProc: { type: "file", filename: messageLogFileName },
        console: { type: 'console' }
    },
    categories: {
        Bot: { appenders: [ 'console', 'Core' ], level: 'trace' },
        Message: { appenders: [ 'MessageProc' ], 'level': 'trace'},
        anonymous: {appenders: [ 'Core' ], level: 'trace'},
        default: { appenders: [ 'console' ], level: 'trace' },
    }
});

/*****************************************
 * Log function name mapping
 * coreLogger           =>  Log        
 * messageProcLogger    =>  msgLog
 * anonymousLogger      =>  AnonymousLog
 * 
 * Log functionality
 *                          File          Screen        No Prompt
 * console.log              false         true          false
 * coreLogger               true          true          false
 * messageProcLogger        true          false         true
 * anonymousLogger          true          false         true
 *****************************************/

const coreLogger = log4js.getLogger('Bot');
const messageProcLogger = log4js.getLogger('Message')
const anonymousLogger = log4js.getLogger('anonymous')

let DiagnosticLog = {
    info: (text) => {
        if(config.diagnosticChannel.enable) { Bot.telegram.sendMessage(`${config.diagnosticChannel.channel}`, "Info\n" + text) }
    },
    debug: (text) => {
        if(config.diagnosticChannel.enable) { Bot.telegram.sendMessage(`${config.diagnosticChannel.channel}`, "Debug\n" + text) }
        Log.debug(text)
    },
    warning: (text) => {
        if(config.diagnosticChannel.enable) { Bot.telegram.sendMessage(`${config.diagnosticChannel.channel}`, "Warning\n" + text) }
        Log.warning(text)
    },
    fatal: (text) => {
        if(config.diagnosticChannel.enable) { Bot.telegram.sendMessage(`${config.diagnosticChannel.channel}`, "Fatal\n" + text) }
        Log.fatal(text)
    }
}

let Log = {
    info: (text) => {
        coreLogger.info(text)
    },

    trace: (text) => {
        coreLogger.trace(text)
    },

    debug: (text) => {
        coreLogger.debug(text)
    },

    warning: (text) => {
        coreLogger.warn(text)
    },

    fatal: (text) => {
        coreLogger.fatal(text)
    }    
}

let messageStdout = {
    log: (text) => {
        messageProcLogger.info(text)
    }
}

let AnonymousLog = {
    info: (text) => {
        anonymousLogger.info(text)
    },

    trace: (text) => {
        anonymousLogger.trace(text)
    },

    debug: (text) => {
        anonymousLogger.debug(text)
    },

    warning: (text) => {
        anonymousLogger.warn(text)
    },

    fatal: (text) => {
        anonymousLogger.fatal(text)
    }
}

exports.AnonymousLog = AnonymousLog
exports.DiagnosticLog = DiagnosticLog
exports.msgLog = messageStdout
exports.Log = Log