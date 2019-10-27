// Dependencies

let log4js = require("log4js")

// Local Packages

let Core = require("../core")
let Bot = require("../Core/bot").Telegram.Bot
let config = require("../config.json")

let coreLogFileName =
    "./log/" +
    config.botname +
    "-" +
    "Core-Log" +
    "-" +
    Core.Time.logTime +
    ".log"
let messageLogFileName =
    "./log/" +
    config.botname +
    "-" +
    "Message-Log" +
    "-" +
    Core.Time.logTime +
    ".log"

log4js.configure({
    appenders: {
        Core: { type: "file", filename: coreLogFileName },
        MessageProc: { type: "file", filename: messageLogFileName },
        console: { type: "console" }
    },
    categories: {
        Bot: { appenders: ["console", "Core"], level: "trace" },
        Message: { appenders: ["MessageProc"], level: "trace" },
        anonymous: { appenders: ["Core"], level: "trace" },
        default: { appenders: ["console"], level: "trace" }
    }
})

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

const coreLogger = log4js.getLogger("Bot")
const messageProcLogger = log4js.getLogger("Message")
const anonymousLogger = log4js.getLogger("anonymous")

let DiagnosticLog = {
    info: (text) => {
        DiagnosticLog.counter(text)
        if (config.diagnosticChannel.enable) { 
            Bot.telegram.sendMessage(`${config.diagnosticChannel.channel}`, "🗎 Info\n" + text)
        }
    },
    debug: (text) => {
        DiagnosticLog.counter(text)
        if (config.diagnosticChannel.enable && DiagnosticLog.count == 0) {
            Bot.telegram.sendMessage(`${config.diagnosticChannel.channel}`, "⚙️ Debug\n" + text)
        }
        Log.debug(text)
    },
    warning: (text) => {
        DiagnosticLog.counter(text)
        if (config.diagnosticChannel.enable && DiagnosticLog.count == 0) {
            Bot.telegram.sendMessage(`${config.diagnosticChannel.channel}`, "⚠️ Warning\n" + text)
        }
        Log.warning(text)
    },
    fatal: (text) => {
        DiagnosticLog.counter(text)
        console.log("1 ", config.diagnosticChannel.enable && DiagnosticLog.count == 0)
        if (config.diagnosticChannel.enable && DiagnosticLog.count == 0) {
            let trimmer = new RegExp(__dirname.replace(/\/Core/gu, ""), "gu")
            let stack = JSON.stringify(text.stack).replace(trimmer, ".")
            Bot.telegram.sendMessage(`${config.diagnosticChannel.channel}`, "🚨 Fatal\n" + JSON.parse(stack))
        }
        Log.fatal(text)
    },
    counter: (text) => {
        Core.getKey("logtext").then(res => {
            if(text.message == res) {
                DiagnosticLog.count++
            }
            if(text.message != res) {
                DiagnosticLog.count = 0
            }
            Core.setKey("logtext", text.message, 'EX', 1 * 60)
        })
    },
    count: 0
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
