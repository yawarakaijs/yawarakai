// Dependencies

let readline = require('readline')
let process = require('process')

// Time Control

let SysTime = new Date()
let Time = {
  Date: SysTime,
  runningTime: SysTime.getFullYear() + "-" + ("0" + (SysTime.getMonth() + 1)).slice(-2) + "-" + ("0" + SysTime.getDate()).slice(-2) + "-" + ("0" + SysTime.getHours()).slice(-2) + "-" + ("0" + SysTime.getMinutes()).slice(-2) + "-" + ("0" + SysTime.getSeconds()).slice(-2),
  logTime: SysTime.getFullYear() + "-" + ("0" + (SysTime.getMonth() + 1)).slice(-2) + "-" + ("0" + SysTime.getDate()).slice(-2)
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

exports.cliInput = promptInput
exports.Time = Time