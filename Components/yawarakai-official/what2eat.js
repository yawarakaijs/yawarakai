// Dependecies

let Compo = require('../../component')

// Component Method

let config = require('./config.json')

// Change the Component Name according to the config.json

exports.meta = config.components.componentName

// Inner

exports.commands = {
    async main() {

    }
}

exports.inlines = {
    async main () {

    }
}

exports.messages = {
    async main() {

    }
}

exports.callbackQuery = {
    async main () {

    }
}

exports.channelPost = {
    async main () {

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
        // {
            // function: 'main'
        // }
    ],
    callbackQuery: [
        // {
        //     function: 'main'
        // }
    ],
    channelPost: [
        // {
        //     function: 'main'
        // }
    ]
}