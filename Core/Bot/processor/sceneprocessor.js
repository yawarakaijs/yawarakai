// Local Packages

let Store = require('../../storage')

let SceneData = new Array()
let SceneTrigger = new Map()
let SceneDictionaryData = new Array()

/**
 * Scene   
 * Create a scene class and now object to make a trigger for stage-like control.   
 * Scene is designed for the stage control, 'scene', which is the meaning itself,
 * the situation. Based on different situation, messages or commands may be
 * processed differently, this won't effect the inline, channel post, callbackquery.   
 * Scene will only take place when the message or the trigger command has been 
 * executed, when a user is inside the scene, Yawarakai will ignore the other
 * message distributor or the processor to the other components, the user's
 * message will be redirected to the scene registered function to process in its
 * own.
 * This made a great experience where you need to make a wizard or make a short or
 * 'question' based setup while in the interaction with user.
 * 
 * Setup   
 * Create Scene inside the code, and bind a function or a set of functions to it,
 * and make a first step command or message function to trigger it, you can use the 
 * Scene.enter method to enter a scene for user whereever you have a valid function,
 * in the correct tern is "let the user enter the scene".   
 * Process   
 * The distributor will redirect the message as the ctx which knwon as Telegraf 
 * context object into the function you have binded it on. Process the stage and other
 * information inside the function you binded to, use Scene.next to enter next stage.   
 * Exiting   
 * In any situation, system has a ultimate command to cancel, which is /cancel.
 * If you want to exit the scene for a specific command or situation, use Scene.exit
 * to exit a scene. This will only effect the user.
 * 
 *  
 * @param {string} tag              - Scene Name
 * @example                           [{reg: "a.*", mode: "gui"}]
 * @param {Array} funcnameArray     - Function names without brackets
 * @example                           [className.functionName, className.functionName2] 
 * @param {Boolean} hasArgs         - Switch for whether to use args
 * @example                           false
 * @param {Array} funcArgsArray     - Arguments for functions, for multi functions
 * @example                           [["arg1", "args2", false], ["args3", 42]] 
 * 
 * @method enter(ctx)               - Update the user id in "in scene", and enter the scene for id
 * @method exit(ctx)                - Update the user id in "not in scene", and exit the scene for id
 * @method has(ctx)                 - Query the id to see if in this specific scene
 * @method status(ctx)              - Query the id to get the current scene status of the specific id
 * @method next(ctx,last)           - Update the specified id to next stage       
 * @method bind(functionArray)      - Bind a set of function(s) into the scene
 * @method inject(argsArray)        - Inject a set(s) of arguments of functions of this scene into the scene
 * 
 * @property now                    - Object of the current scene data
 * @example                           { key: "scene", scene: tag, id: 0, stage: 0, last: '' }
 */
class Scene {
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

    on(trigger, cb) {
        SceneTrigger.set(trigger, cb)
    }

    text(trigger, cb) {

    }

    emit(trigger, ...args) {
        if (SceneTrigger.has(trigger)) {
            let cb = SceneTrigger.get(trigger)
            cb(...args)
        }
    }

    /**
     * Update the user id in "in scene", and enter the scene for id
     * Returns true if entered, returns false if the id has been already in scene
     * @param {Telegrf Context Object} ctx  - The context from telegraf
     * @returns                             - The boolean true or false based on the result
     */
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

    /**
     * Update the user id in "not in scene", and exit the scene for id
     * @param {Telegrf Context Object} ctx  - The context from telegraf 
     */
    exit(ctx) {

        let res = SceneData.filter(item => item.id != ctx.message.from.id)
        SceneData = new Array()
        res.forEach(item => {
            SceneData.push(item)
        })

    }

    /**
     * Query the id to see if in this specific scene
     * Returns true if id is in this scene, vice versa
     * @param {Telegrf Context Object} ctx  - The context from telegraf
     * @returns                             - The boolean true or false based on the result
     */
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
        return false
    }

    /**
     * Query the id to get the current scene status of the specific id
     * Returns a object that contains the Now data if id is in scene, returns false when id is not in the scene 
     * @param {Telegrf Context Object} ctx  - The context from telegraf
     * @returns                             - The boolean true or false based on the result
     */
    status(ctx) {
        for (let i = 0; i < SceneData.length; i++) {
            if (SceneData[i].id == ctx.message.from.id) {
                return SceneData[i]
            }
        }
        return false
    }

    /**
     * Update the specified id to next stage
     * Returns a object that contains a Now data for this id and the next data
     * @param {Telegrf Context Object} ctx  - The context from telegraf
     * @param {string} last                 - Last reply string
     * @returns                             - The object that contains Now data with updated stages and last
     */
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

    /**
     * Bind a set of function(s) into the scene
     * @param {Array} funcArray             - Array contains all function that needs to be executed
     */
    bind(funcArray) {
        let newFuncs = this.funcs
        funcArray.forEach(item => {
            newFuncs.push(item)
        })
        let unset = SceneData.filter(item => item.tag !== this.now.scene)
        unset.push({
            tag: this.now.scene,
            funcs: newFuncs,
            hasArgs: this.hasArgs,
            funcArgs: this.funcArgs
        })
        SceneData = unset
    }

    /**
     * Inject a set(s) of arguments of functions of this scene into the scene
     * @param {Array} funcArgs              - Array contains all function that needs to be executed
     */
    inject(funcArgs) {
        let newHasArgs = this.hasArgs
        let newFuncArgs = this.funcArgs
        newHasArgs = true
        funcArgs.forEach(item => {
            newFuncArgs.push(item)
        })
        let unset = SceneData.filter(item => item.tag !== this.now.scene)
        unset.push({
            tag: this.now.scene,
            funcs: this.funcs,
            hasArgs: newHasArgs,
            funcArgs: newFuncArgs
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
    callFunc(context, arg = "") {
        let result = new Array()
        if (arg !== "") {
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

    /**
     * Query the id to get the current scene name where the id is in now
     * Returns the scene name if id is found in data, returns false if not found
     * @param {float | string} id   - Id of query          
     * @return                      - The boolean of true or false based on the result
     */
    scene(id) {
        for (let i = 0; i < SceneData.length; i++) {
            if (SceneData[i].id == id) {
                return SceneData[i].scene
            }
            return false
        }
    },

    /**
     * Query the id to see if in this specific scene
     * Returns true if id is in this scene, vice versa
     * @param {float | string} id   - Id of query
     * @returns                     - The boolean of true or false based on the result
     */
    has(id) {
        for (let i = 0; i < SceneData.length; i++) {
            if (SceneData[i].id == id) {
                return true
            }
            return false
        }
    },

    /**
     * Update the user id in "in scene", and enter the scene for id into scene name
     * @param {Telegrf Context Object} ctx  - The context from telegraf
     * @param {string} tag                  - The name of scene
     */
    enter(ctx, tag) {
        let now = { key: "scene", scene: tag, id: 0, stage: 0, last: '' }
        now.id = ctx.message.from.id

        SceneData.push(now)
    },

    /**
     * Update the user id in "not in scene", and exit the scene for id
     * @param {Telegrf Context Object} ctx  - The context from telegraf
     */
    exit(ctx) {
        let res = SceneData.filter(item => item.id != ctx.from.id)
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


