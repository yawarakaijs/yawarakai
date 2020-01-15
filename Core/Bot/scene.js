// Dependencies



// Local Package

let Scene = require('./sceneprocessor').Scene
let SceneControl = require('./sceneprocessor').SceneControl

let basicScene = new Scene("basic", [basic])

function basic(context) {
    context.telegram.sendMessage(context.ctx.message.chat.id, `Welcome, ${context.ctx.message.from.username}!`)
}

function switcher(context, tag) {
    switch(tag) {
        case "nlpmatch":
            return standBy(context, 'basic')
        default:
            return undefined
    }
}

function standBy(context, tag) {
    let ctx = context.ctx
    // check if has
    if (SceneControl.has(ctx.message.from.id)) {
        let matchResult = SceneControl.tryMatch(ctx.message.text)
        if (matchResult.length == 0) {
            return undefined
        }
        SceneControl.callFunc(matchResult, context)
    }
    else {
        //SceneControl.enter(ctx.message.from.id, 'basic')
        SceneControl.enter(ctx, tag)
        context.telegram.sendMessage(ctx.message.chat.id, `First time to see you, ${ctx.message.from.username}`)
    }
}

exports.switcher = switcher