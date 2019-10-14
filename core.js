// Dependencies

var spawn = require('child_process').spawn;
let readline = require('readline')
let process = require('process')
let redis = require('redis')
let { promisify } = require('util')

// Local Packages

let Log = require('./Core/log')
let Bot = require('./Core/bot')
let Lang = require('./Core/lang').Lang
let Component = require('./component')
let config = require('./config.json')

// Time Control

let SysTime = new Date()
let Time = {
  Date: SysTime,
  runningTime: SysTime.getFullYear() + "-" + ("0" + (SysTime.getMonth() + 1)).slice(-2) + "-" + ("0" + SysTime.getDate()).slice(-2) + "-" + ("0" + SysTime.getHours()).slice(-2) + "-" + ("0" + SysTime.getMinutes()).slice(-2) + "-" + ("0" + SysTime.getSeconds()).slice(-2),
  logTime: SysTime.getFullYear() + "-" + ("0" + (SysTime.getMonth() + 1)).slice(-2) + "-" + ("0" + SysTime.getDate()).slice(-2)
}

// Redis

let client = redis.createClient(config.redis.port, config.redis.host)

client.on('error', function (err) {
  Log.Log.fatal(`${Lang.core.redisAuthFail}`)
  Log.Log.fatal(`${Lang.core.redisCausedShutdown}`)
  return
})

client.auth(config.redis.auth, () => {
  Log.Log.trace(`${Lang.core.redisAuthSuccess}`)
})

let getKeyAsync = promisify(client.get).bind(client)
let setKeyAsync = promisify(client.set).bind(client)

// CLI

const rl = readline.createInterface(process.stdin, process.stdout)

function promptInput(prompt, handler) {
  rl.question(prompt, input => {
    if (handler(input) !== false) {
      promptInput(prompt, handler)
    }
    else {
      rl.close()
    }
  })
}

exports.Bot = Bot
exports.cliInput = promptInput
exports.Time = Time
exports.getKey = getKeyAsync
exports.setKey = setKeyAsync