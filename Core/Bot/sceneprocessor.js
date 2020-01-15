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

        Store.find({ key: "sceneIds" }).then(res => {
            let arr = JSON.parse(res[0].ids)
            arr = arr.filter(values => values != ctx.message.from.id)
            arr.push(ctx.message.from.id)
            Store.update({ key: "sceneIds" }, { $set: { ids: arr } }, {})
        }).catch(err => {
            let arr = new Array()
            arr.push(ctx.message.from.id)
            Store.insert({ key: "sceneIds", ids: arr })
        })

        SceneData.push(this.now)
        Store.insert(this.now).then(res => {
            return res
        })
    }

    exit(ctx) {
        SceneData.push(SceneData.filter(item => item.id != ctx.message.from.id))

        Store.remove({ id: ctx.message.from.id }, {}).then(res => {
            return res
        }).catch(err => {
            return false
        })
    }

    has(ctx) {
        Store.find({ id: ctx.message.from.id }).then(res => {
            return true
        }).catch(err => {
            return false
        })
    }

    status(ctx) {
        Store.find({ id: ctx.message.from.id }).then(res => {
            return res[0]
        }).catch(err => {
            return false
        })
    }

    next(ctx, last) {
        Store.find({ id: ctx.message.from.id }).then(res => {
            res = res[0]
            return Store.update({ id: ctx.message.from.id }, { $set: { stage: res.stage + 1, last: last } }, {}).then(res => {
                return res
            })
        })
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

        Store.find({ key: "sceneIds" }).then(res => {
            let arr = JSON.parse(res[0].ids)
            arr = arr.filter(values => values != ctx.message.from.id)
            arr.push(ctx.message.from.id)
            Store.update({ key: "sceneIds" }, { $set: { ids: arr } }, {})
        }).catch(err => {
            let arr = new Array()
            arr.push(ctx.message.from.id)
            Store.insert({ key: "sceneIds", ids: arr })
        })

        SceneData.push(now)
        Store.insert(now).then(res => {
            return res
        })
    },

    exit(ctx) {
        SceneData.push(SceneData.filter(item => item.id != ctx.message.from.id))

        Store.remove({ id: ctx.message.from.id }, {}).then(res => {
            return res
        }).catch(err => {
            return false
        })
    }
}

module.exports = {
    Scene,
    SceneControl
}


