// Dependecies

let Compo = require('../../component')

// Component Method

let config = require('./config.json')

// Inner

exports.commands = {
    main: async function () {

    }
}

exports.inlines = {
    main: async function () {

    }
}

exports.register = {
    // As the example to Yawarakai Compos
    commands: [
        {
            cmdReg: 'main'
        }
    ],
    inlines: [
        {
            ilnReg: "main"
        }
    ],
    messages: [
        {

        }
    ]
}