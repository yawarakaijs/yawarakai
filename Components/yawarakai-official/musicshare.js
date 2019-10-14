let axios = require('axios');


exports.commands = {
    main: async function (ctx) {
        
    }
}

exports.inlines = {
    main: async function (ctx) {
        
    }
}

exports.messages = {
    main: async function (ctx) {

    }
}

exports.register = {
    // As the example to Yawarakai Compos
    commands: [
        // {
        //     cmdReg: 'main'
        // }
    ],
    inlines: [
        {
            ilnReg: 'main'
        }
    ],
    messages: [
        // {
        //     msgReg: 'main'
        // }
    ]
}