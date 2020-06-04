// Dependencies

// Local Packages

let Log = require('../log')
let { Scene, SceneControl } = require('../Bot/processor/sceneprocessor')
let Store = require('../storage')

let broadcastScene = new Scene('broadcast', [scene])

async function scene(context) {
    let id = context.ctx.message.from.id
    let stage = broadcastScene.status(context.ctx).stage

    switch (stage) {
        case 0:
            let textToBeSent = context.ctx.message.text
            context.telegram.sendMessage(id, `请问是要发送这样的广播信息吗？\n\n${textToBeSent}`, {
                parse_mode: "Markdown",
                reply_to_message_id: context.ctx.message.message_id,
                reply_markup: {
                    inline_keyboard: [[
                        {
                            text: "确定",
                            callback_data: "broadcastMsgConfirm"
                        },
                        {
                            text: "再修改一下",
                            callback_data: "broadcastMsgEdit"
                        }
                    ]]

                }
            }).catch(err => {
                Log.Log.fatal(err)
            })
            break
        case 1:
            context.telegram.sendMessage(id, "好的哦")
            break
    }
}

let Control = {
    async start(context) {
        let incomingUserId = context.ctx.message.from.id
        let isAdmin = await Store.isAdmin(context.ctx.message.from.id)
        if (isAdmin) {
            context.telegram.sendMessage(incomingUserId, "想要发送什么呢？\n如果不想发送了就点击 /cancel 就好", { reply_to_message_id: context.ctx.message.message_id }).catch(err => {
                Log.Log.fatal(err)
            })
        }
        else {
            context.telegram.sendMessage(incomingUserId, "不是管理员是不可以发送广播的哦。", { reply_to_message_id: context.ctx.message.message_id }).catch(err => {
                Log.Log.fatal(err)
            })
            SceneControl.exit(context.ctx)
        }
    }
}



exports.start = Control.start
exports.Control = Control