// Basic strategy
// Try to match and return the value for processing
// Use middleware to check if needed to call function
// Call CallFunc if needed
// If not, keep processing this data until finished

// This is a global message trigger system
// A bit different with components one, the components
// message trigger was designed only for match the text and
// Yawarakai to call the Components to process it
// This global message trigger is for the system to process
// any info as many as possible and along with the functions
// that needs to be executed

/**
 * let template = {
 *     match: [{ reg: "beep|Beep", mode: "gui" }],
 *     reply: `["Boop"]`,
 *     funcs: [prints.ArgsA, prints.ArgsB],
 *     hasArgs: true,
 *     funcArgs: [["this is a", "this is b", "this is c"], ["this is 2a", "this is 2b", "this is 2c"]]
 *  }
 */

let MessageDictionaryControl = {
/**
 * Try to match the text with the dictionary with its own
 * This will return the object of the found match
 * @param {string} text -   The text that needs to be checked
 * @return {object}     -   The found dictionary item, include the index of dictionary, whether or not have functions, and the reply
 */
    tryMatch: function (text) {
        let result = { index: 0, hasFunc: false, hasArgs: false, reply: [] }
        MessageDictionaryData.map((item, index) => {
            item.match.map((regobj) => {
                let regex = new RegExp(regobj.reg, regobj.mode)
                let status = regex.test(text)
                if (status) {
                    result.index = index
                    if (item.funcs[0]) {
                        result.hasFunc = true
                    }
                    else {
                        result.hasFunc = false
                    }
                    result.reply = item.reply
                    result.hasArgs = item.hasArgs
                }
            })
        })
        return result
    },

    /**
     * Call the functions that matches
     * @param {object} context - The object that contains the information of matching 
     */
    callFunc: function (context) {
        let result = new Array()
        if (context.hasArgs) {
            let value = MessageDictionaryData[context.index]
            value.funcs.map((funcname, index) => {
                result.push(funcname.apply(this, value.funcArgs[index]))
            })[0]
        }
        return result
    }
}

let MessageDictionaryData = new Array()

class MessageDictionary {
    /**
     * Construct a Dictionary class to interact with DictionaryData
     * @param {Array} matchArray    - Objects that contains regex and regex mode key for matching
     * @example [{reg: "a.*", mode: "gui"}]
     * @param {Array} replyArray    - Messages needs to be replied
     * @example ["reply message", "reply message two"]
     * @param {Array} funcnameArray - Function names without brackets
     * @example [className.functionName, className.functionName2] 
     * @param {Boolean} hasArgs       - Switch for whether to use args
     * @example false
     * @param {Array} funcArgsArray - Arguments for functions, for multi functions
     * @example [["arg1", "args2", false], ["args3", 42] 
     */
    constructor(matchArray, replyArray = new Array(), funcnameArray = new Array(), hasArgs = false, funcArgsArray = new Array) {
        this.match = matchArray
        this.reply = replyArray
        this.funcs = funcnameArray
        this.hasArgs = hasArgs
        this.funcArgs = funcArgsArray
        this.merge = {
            match: this.match,
            reply: this.reply,
            funcs: this.funcs,
            hasArgs: this.hasArgs,
            funcArgs: this.funcArgs,
        }
    }
    push() {
        MessageDictionaryData.push(this.merge)
    }
}

module.exports = {
    MessageDictionary,
    MessageDictionaryControl
}