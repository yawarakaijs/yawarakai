// Dependencies

let log4js = require('log4js')

// Local Packages

let core = require('./core')
let config = require('./config.json')

let coreLogFileName = "./log/" + config.botname + "-" + "Core-Log" + "-" + core.Time.logTime + ".log"
let messageLogFileName = "./log/" + config.botname + "-" + "Message-Log" + "-" + core.Time.logTime + ".log"

log4js.configure({
    appenders: {
        Core: { type: 'file', filename: coreLogFileName },
        MessageProc: { type: "file", filename: messageLogFileName },
        console: { type: 'console' }
    },
    categories: {
        Bot: { appenders: ['console', 'Core'], level: 'trace' },
        Message: { appenders: [ 'MessageProc' ], 'level': 'trace'},
        anonymous: {appenders: [ 'Core' ], level: 'trace'},
        default: { appenders: ['console', 'Core'], level: 'trace' },
    }
});

const coreLogger = log4js.getLogger('Bot');
const messageProcLogger = log4js.getLogger('Message')
const anonymousLogger = log4js.getLogger('anonymous')

let Log = {
    info: (text) => {
        coreLogger.info(text);
    },

    trace: (text) => {
        coreLogger.trace(text);
    },

    debug: (text) => {
        coreLogger.debug(text);
    },

    warning: (text) => {
        coreLogger.warn(text);
    },

    fatal: (text) => {
        coreLogger.fatal(text);
    }    
}

let messageStdout = {
    log: (text) => {
        messageProcLogger.info(text);
    }
}

let AnonymousLog = {
    info: (text) => {
        anonymousLogger.info(text);
    },

    trace: (text) => {
        anonymousLogger.trace(text);
    },

    debug: (text) => {
        anonymousLogger.debug(text);
    },

    warning: (text) => {
        anonymousLogger.warn(text);
    },

    fatal: (text) => {
        anonymousLogger.fatal(text);
    }
}

exports.AnonymousLog = AnonymousLog;
exports.msgLog = messageStdout;
exports.Log = Log;