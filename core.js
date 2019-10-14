// Dependencies

var spawn = require('child_process').spawn;
let readline = require('readline')
let process = require('process')
let redis = require('redis')
let { promisify } = require('util')

// Local Packages

let Log = require('./log')
let Bot = require('./bot')
let Lang = require('./lang').Lang
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

let restart = () => {
  if (process.env.process_restarting) {
    delete process.env.process_restarting;
    // Give old process one second to shut down before continuing ...
    setTimeout(restart, 1000);
    return;
  }

  Log.Log.info("即将重新启动 Yawarakai...")
  // Restart process ...
  spawn(process.argv[0], process.argv.slice(1), {
    env: { process_restarting: 1 },
    stdio: 'ignore'
  }).unref();
}

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

exports.restart = restart
exports.Bot = Bot
exports.cliInput = promptInput
exports.Time = Time
exports.getKey = getKeyAsync
exports.setKey = setKeyAsync