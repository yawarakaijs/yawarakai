const axios = require("axios")
const config = require("./config.json")
const Compo = require("../../component")

let main = {
    answer: (ctx, query, result, middleWord) => {
        var data = [{
            type: "voice",
            id: ctx.inlineQuery.id,
            title: `${query}`,
            voice_url: "https://tts.hjapi.com/jp/8C59EF4A0807373BCD744E967B07B580",
            description: result,
            caption: "Music Requested",
            thumb_url: "https://i.loli.net/2019/10/04/eNxTQaftWrh7Lsd.jpg"
        }]
        return data
    }
}

exports.meta = config.components.musicshare

exports.commands = {
    main: async function (ctx) { }
}

exports.inlines = {
    main: async function (ctx) {
        let isNeteaseLink = new RegExp("((https?:\\/\\/)|())(music.163.com)\\/(song|album|playlist)\\/\\d+\\??((userid=\\d+)|())", "ui")
        let isMusic = new RegExp("music")
        if (isMusic.test(ctx.inlineQuery.query)) {
            return main.answer(ctx, ctx.inlineQuery.query, "Hey")
        }
    }
}

exports.messages = {
    main: async function (ctx) { }
}

exports.callbackQuery = {
    main: async function (ctx) {
    }
}

exports.register = {
    // As the example to Yawarakai Compos
    commands: [
        // {
        //     function: 'main'
        // }
    ],
    inlines: [
        // {
        //     function: "main"
        // }
    ],
    messages: [
        // {
        //     function: 'main'
        // }
    ],
    callbackQuery: [
        // {
        //     function: 'main'
        // }
    ]
}
