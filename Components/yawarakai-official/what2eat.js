// Dependecies

let Compo = require('../../component')

// Component Method

let config = require('./config.json')

// Change the Component Name according to the config.json

exports.meta = config.components.componentName

// Inner

exports.commands = {
    main: async function () {

    }
}

exports.inlines = {
    main: async function () {

    }
}

exports.messages = {
    main: async function () {

    }
}

exports.callbackQuery = {
    main: async function () {

    }
}

// Register

exports.register = {
    // As the example to Yawarakai Compos
    commands: [
        {
            // function: 'main'
        }
    ],
    inlines: [
        {
            // function: "main"
        }
    ],
    messages: [
        {
            // function: 'main'
        }
    ],
    callbackQuery: [
        // {
        //     function: 'main'
        // }
    ]
}