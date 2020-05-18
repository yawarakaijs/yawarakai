// Dependencies

let Telegraf = require('telegraf')
let SocksProxyAgent = require('socks-proxy-agent');

// Local Packages

let config = require('../../config.json')
let Log = require('../log')

// Proxy
// SOCKS proxy to connect to
let proxy = process.env.socks_proxy || config.proxy.url

// create an instance of the `SocksProxyAgent` class with the proxy server information
let agent = new SocksProxyAgent(proxy)

// Creating Bot
// At this time Single User

let Bot

if(config.proxy.enable) {
    Bot = new Telegraf(config.telegram.token, { telegram: { agent: agent } }).catch(err => {
        Log.DiagnosticLog.fatal(err)
    })
}
else {
    Bot = new Telegraf(config.telegram.token).catch(err => {
        Log.DiagnosticLog.fatal(err)
    })
}

exports.Bot = Bot