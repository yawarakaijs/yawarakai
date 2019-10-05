// Dependencies

var spawn = require('child_process').spawn;
let readline = require('readline')
let process = require('process')

// Local Packages

let Log = require('./log')
let Bot = require('./bot')
let Component = require('./component')

// Time Control

let SysTime = new Date()
let Time = {
    Date: SysTime,
    runningTime: SysTime.getFullYear() + "-" + ("0"+(SysTime.getMonth()+1)).slice(-2) + "-" + ("0" + SysTime.getDate()).slice(-2) + "-" + ("0" + SysTime.getHours()).slice(-2) + "-" + ("0" + SysTime.getMinutes()).slice(-2) + "-" + ("0" + SysTime.getSeconds()).slice(-2),
    logTime: SysTime.getFullYear() + "-" + ("0"+(SysTime.getMonth()+1)).slice(-2) + "-" + ("0" + SysTime.getDate()).slice(-2)
}

let restart = () =>  {
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

function promptInput (prompt, handler) {
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