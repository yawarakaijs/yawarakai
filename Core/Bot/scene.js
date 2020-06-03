// Dependencies



// Local Package

let Scene = require('./processor/sceneprocessor').Scene
let SceneControl = require('./processor/sceneprocessor').SceneControl

/**
 * 
 * let basicScene = new Scene("basic", [basic])
 * 
 * function basic(context) {
 *    // todo
 * }
 */

function switcher(context, tag) {
    // match the set for each scene
    switch(tag) {
        // case "nlpmatch":
            // call the scene name
            // return standBy(context, 'basic')
        case "broadcast":
            return dispatach(context, 'broadcast')
        default:
            return false
    }
}

function dispatach(context, tag) {
    let ctx = context.ctx
    // check if has
    if (SceneControl.has(ctx.message.from.id)) {
        let matchResult = SceneControl.tryMatch(ctx.message.text)
        if (matchResult.length === 0) {
            return undefined
        }
        SceneControl.callFunc(matchResult, context)
    }
    else {
        SceneControl.enter(ctx, tag)
    }
}

exports.switcher = switcher