// Dependencies

const Compo = require("../../component")
const mineflayer = require("mineflayer")
const AutoAuth = require("mineflayer-auto-auth")

// Component Method

let config = require('./config.json')

exports.meta = config.components.minecraft

// Inner
let minecraftConfig = config.components.minecraft
let Bot = mineflayer.createBot({
    hostname: minecraftConfig.hostname,
    port: minecraftConfig.port,
    version: false,

    plugins: [AutoAuth],
    AutoAuth: minecraftConfig.authpassword
})

Bot.on("chat", async (username, message) => {
    try {
        Compo.Interface.Session.Global.isFirst("minecraft").then(res => {
            if (res) {
                Compo.Interface.Telegram.telegram.sendMessage(Compo.Data.admin, "请先绑定聊天或者群组。")
            }
            else {
                Compo.Interface.Session.Global.query("chat", "minecraft").then(res => {
                    res.value.forEach(id => {
                        Compo.Interface.Telegram.telegram.sendMessage(id, `${username}: ${message}`)
                    })
                })
            }
        })
    }
    catch (err) {
        Compo.Interface.Log.Log.fatal(err)
    }
})

let callbackQuery = {
    bind(context) {
        context.ctx.tg.deleteMessage(context.ctx.callbackQuery.message.chat.id, context.ctx.callbackQuery.message.message_id)
        context.ctx.tg.sendMessage(context.ctx.callbackQuery.message.chat.id, "好了呢")
    },
    unbind(context) {
        context.ctx.tg.deleteMessage(context.ctx.callbackQuery.message.chat.id, context.ctx.callbackQuery.message.message_id)
        context.ctx.tg.sendMessage(context.ctx.callbackQuery.message.chat.id, "好了呢，已经取消了")
    }
}

exports.scenes = {
    async minecraft(context) {

    }
}

exports.commands = {
    async bindChat(context) {
        let ctx = context.ctx
        Compo.Interface.Session.Global.query("chat", "minecraft").then(res => {
            if (!res || res.value == ctx.message.chat.id) {
                Compo.Interface.Telegram.telegram.sendMessage(ctx.message.chat.id, "你确定要绑定 Minecraft 服务器的消息到 " + ctx.message.chat.title + " 吗？", {
                    reply_markup: {
                        inline_keyboard: [[
                            {
                                text: "确定",
                                callback_data: "minecraft:bindconfirm"
                            }
                        ]]
                    }
                })
            }
            else {
                Compo.Interface.Telegram.telegram.sendMessage(ctx.chat.id, "已经设置过了。")
            }
        })
    },
    async unbindChat(context) {
        let ctx = context.ctx
        Compo.Interface.Session.Global.query("chat", "minecraft").then(res => {
            if (res) {

                ctx.tg.sendMessage(ctx.message.chat.id, "你确定要取消绑定 Minecraft 服务器的消息链接到 " + ctx.message.chat.title + "吗？", {
                    reply_markup: {
                        inline_keyboard: [[
                            {
                                text: "确定",
                                callback_data: "minecraft:bindremove"
                            }
                        ]]
                    }
                })
            }
            else {
                ctx.tg.sendMessage(ctx.message.chat.id, "该群组未绑定过任何服务器。")
            }
        })
    }
}

exports.messages = {
    async main(context) {

    }
}

exports.callbackQuery = {
    async main(ctx) {

        if (!ctx.callbackQuery.data.startsWith("minecraft")) {
            return undefined
        }

        let callbackData = ctx.callbackQuery
        let chatId = callbackData.message.chat.id
        let dataString = callbackData.data
        dataString = dataString.replace(/minecraft:/, "")

        context = { telegram: this.telegram, ctx: ctx }

        console.log(dataString)

        switch (dataString) {
            case "bindconfirm":
                Compo.Interface.Session.Global.exist("chat", "minecraft").then(res => {
                    if (res) {
                        Compo.Interface.Session.Global.update("chat", chatId, "minecraft")
                    }
                    else {
                        Compo.Interface.Session.Global.append("chat", [chatId], "minecraft")
                    }
                })
                callbackQuery.bind(context)
                break
            case "bindremove":
                Compo.Interface.Session.Global.exist("chat", "minecraft").then(res => {
                    if (res) {
                        Compo.Interface.Session.Global.update("chat", chatId, "minecraft")
                    }
                    else {
                        Compo.Interface.Session.Global.append("chat", [chatId], "minecraft")
                    }
                })
                callbackQuery.unbind(context)
                break
        }
    }
}

// Register

exports.register = {
    // As the example to Yawarakai Compos
    commands: [
        {
            function: 'bindChat'
        },
        {
            function: 'unbindChat'
        }
    ],
    messages: [
        // {
        // function: 'main'
        // }
    ],
    callbackQuery: [
        {
            function: 'main'
        }
    ],
    scenes: [
        // {
        //     name: 'sceneName',
        //     function: 'scenePerformFunction'
        // }
    ]
}