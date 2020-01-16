// Local Packages

let Store = require('../storage')

let SceneData = new Array()
let SceneDictionaryData = new Array()

class Scene {
    /**
     * @param {string} tag              - Scene Name
     * @example [{reg: "a.*", mode: "gui"}]
     * @param {Array} funcnameArray     - Function names without brackets
     * @example [className.functionName, className.functionName2] 
     * @param {Boolean} hasArgs         - Switch for whether to use args
     * @example false
     * @param {Array} funcArgsArray     - Arguments for functions, for multi functions
     * @example [["arg1", "args2", false], ["args3", 42]] 
     */
    constructor(tag, funcnameArray = new Array(), hasArgs = false, funcArgsArray = new Array) {
        this.tag = tag
        this.funcs = funcnameArray
        this.hasArgs = hasArgs
        this.funcArgs = funcArgsArray
        this.merge = {
            tag: this.tag,
            funcs: this.funcs,
            hasArgs: this.hasArgs,
            funcArgs: this.funcArgs
        }
        SceneDictionaryData.push(this.merge)
        this.now = { key: "scene", scene: tag, id: 0, stage: 0, last: '' }
    }

    enter(ctx) {
        this.now.id = ctx.message.from.id

        if (this.has(ctx)) {
            return false
        }
        else {
            SceneData.push(this.now)
            return true
        }
    }

    exit(ctx) {

        let res = SceneData.filter(item => item.id != ctx.message.from.id)
        SceneData = new Array()
        res.forEach(item => {
            SceneData.push(item)
        })

    }

    has(ctx) {
        let result = new Array()
        for (let i = 0; i < SceneData.length; i++) {
            if (SceneData[i].id == ctx.message.from.id) {
                result.push(SceneData[i])
            }
        }
        if (result.length > 0) {
            return true
        }
        else {
            return false
        }
    }

    status(ctx) {
        for (let i = 0; i < SceneData.length; i++) {
            if (SceneData[i].id == ctx.message.from.id) {
                return SceneData[i]
            }
        }
        return false
    }

    next(ctx, last) {
        let now = SceneData.filter(item => item.id == ctx.message.from.id)[0]
        now.stage = now.stage + 1
        now.last = last
        this.now = now

        let result = SceneData.filter(item => item.id != ctx.message.from.id)
        result.push(now)
        SceneData = result

        return now
    }

    bind(funcArray) {
        this.funcs = funcArray
        let unset = SceneData.filter(item => item.tag != this.now.scene)
        unset.push({
            tag: this.now.scene,
            funcs: funcArray,
            hasArgs: this.hasArgs,
            funcArgs: this.funcArgs
        })
        SceneData = unset
    }

    inject(funcArgs) {
        this.hasArgs = true
        this.funcArgs = funcArgs
        let unset = SceneData.filter(item => item.tag != this.now.scene)
        unset.push({
            tag: this.now.scene,
            funcs: this.funcs,
            hasArgs: true,
            funcArgs: funcArgs
        })
        SceneData = unset
    }
}

let SceneControl = {
    /**
     * Try to match the text with the dictionary with its own
     * This will return the object of the found match
     * @param {string} text -   The text that needs to be checked
     * @return {object}     -   The found dictionary item, include the index of dictionary, whether or not have functions, and the reply
     */
    tryMatch(text) {
        let result = { index: 0, hasArgs: false }
        SceneDictionaryData.map((item, index) => {
            if (item.tag == text) {
                result.index = index
                result.hasArgs = item.hasArgs
            }
        })
        return result
    },

    /**
     * Call the functions that matches
     * @param {object} context - The object that contains the information of matching 
     */
    callFunc(context, arg = undefined) {
        let result = new Array()
        if (arg != undefined) {
            let value = SceneDictionaryData[context.index]
            value.funcs.map((funcname) => {
                result.push(funcname.apply(this, [arg]))
            })[0]
            return result
        }
        else if (context.hasArgs) {
            let value = SceneDictionaryData[context.index]
            value.funcs.map((funcname, index) => {
                result.push(funcname.apply(this, value.funcArgs[index]))
            })[0]
            return result
        }
    },

    scene(id) {
        for (let i = 0; i < SceneData.length; i++) {
            if (SceneData[i].id == id) {
                return SceneData[i].scene
            }
            else {
                false
            }
        }
    },

    has(id) {
        for (let i = 0; i < SceneData.length; i++) {
            if (SceneData[i].id == id) {
                return true
            }
            else {
                false
            }
        }
    },

    enter(ctx, tag) {
        let now = { key: "scene", scene: tag, id: 0, stage: 0, last: '' }
        now.id = ctx.message.from.id

        SceneData.push(now)
    },

    exit(ctx) {
        let res = SceneData.filter(item => item.id != ctx.message.from.id)
        SceneData = new Array()
        res.forEach(item => {
            SceneData.push(item)
        })
    }
}

module.exports = {
    Scene,
    SceneControl
}


