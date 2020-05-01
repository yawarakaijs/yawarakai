// Dependencies

let log4js = require("log4js")

// Local Packages

let config = require("../config.json")

let SysTime = new Date()
let logTime = SysTime.getFullYear() + "-" + ("0" + (SysTime.getMonth() + 1)).slice(-2) + "-" + ("0" + SysTime.getDate()).slice(-2)

let coreLogFileName =
    "./logs/" +
    config.botname +
    "-" +
    "Core-Log" +
    "-" +
    logTime +
    ".log"
let messageLogFileName =
    "./logs/" +
    config.botname +
    "-" +
    "Message-Log" +
    "-" +
    logTime +
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
exports.msgLog = messageStdout
exports.Log = Log
exports.LogFiles = [coreLogFileName, messageLogFileName]
