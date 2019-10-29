const axios = require("axios")
const config = require("./config.json")
const Compo = require("../../component")

let main = {
    answer: (ctx, query, result, middleWord) => {
        var data = {
            type: "audio",
            id: ctx.inlineQuery.id,
            title: `${query}`,
            audio_url: "https://source.yutsuki.moe/cloudmusic/music/test.mp3",
            description: result,
            caption: "Music Requested",
            thumb_url: "https://i.loli.net/2019/10/04/eNxTQaftWrh7Lsd.jpg"
        }
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

exports.register = {
    // As the example to Yawarakai Compos
    commands: [
        // {
        //     cmdReg: 'main'
        // }
    ],
    inlines: [
        {
            ilnReg: "main"
        }
    ],
    messages: [
        // {
        //     msgReg: 'main'
        // }
    ]
}
