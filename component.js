// Dependencies

let fs = require('fs')
let path = require('path')

// Local Files
let Log = require('./Core/log')
let Nlp = require('./Core/Bot/nlp')
let Lang = require('./Core/lang')
let config = require('./config.json')
let Session = require('./Core/session')
let Telegram = require("./Core/Bot/telegram").Bot
let Scene = require('./Core/Bot/processor/sceneprocessor').Scene

let compos = { list: [], path: [], info: [], name: [] }
let compoInfo = new Array()
let compoHelp = new Array()
let compoPair = new Array()
let Compo = { scene: [], command: [], inline: [], message: [], callbackQuery: [], channelPost: [] }

// Body

let Register = {
    load (extensionDir = path.join(__dirname, '/Components/')) {
        try {
            // Init object for later storage
            /**
             * The object that contains the components reflaction function,
             * this Object is loaded by component.js once the app starts up,
             * the later changes can be done through bot command
             * @property {Array} command            - Imported from exports.register.commands
             * @property {Array} inline             - Imported from exports.register.inline
             * @property {Array} message            - Imported from exports.register.message
             * @property {Array} callbackQuery      - Imported from exports.register.callbackQuery
             */
            
            // Read all folders inside the Components folder
            if (!fs.existsSync(extensionDir)) {
                Log.Log.warning(Lang.component.noComponentFound[0])
                Log.Log.warning(Lang.component.noComponentFound[1])
                return Compo
            }
            var files = fs.readdirSync(extensionDir)
            // Iterial all folders to find the config.json under it
            files.forEach((value, index) => {
                let folder = path.join(extensionDir, value)
                let stats = fs.statSync(folder)
                // Check if folder has config.json
                if (fs.existsSync(folder + "/config.json")) {
                    // Load config.json
                    delete require.cache[require.resolve(folder + "/config.json")]
                    let compConfig = require(folder + "/config.json")
                    // Check if config has the components key
                    if (compConfig.components) {
                        // Check if this folder is exist
                        if (stats.isDirectory()) {
                            // Iterial each key inside the components config
                            // configValue represents each component name
                            compoInfo.push(`${Lang.component.loaded[0]}`)
                            for (let [configKey, configValue] of Object.entries(compConfig.components)) {

                                try {

                                    compoPair.push(`\n*${configValue.displayName}*`)
                                    compoPair.push(`${configValue.description}`)
                                    compoPair.push(`${value}/${configValue.name}@${configValue.version}`)

                                    let compoPath = extensionDir + value + "/" + configValue.name + ".js"
                                    let coreExists = fs.statSync(compoPath)

                                    if (coreExists && configValue.enable) {
                                        delete require.cache[require.resolve(compoPath)]
                                        let compo = require(compoPath)

                                        // Check if register commands exist
                                        if (compo.register.commands) {
                                            compo.register.commands.map(cmd => {
                                                cmd.instance = compo.commands[cmd.function]
                                                cmd.meta = compo.meta
                                                Compo.command.push(cmd)

                                                // Append the help text to compoHelp
                                                compoPair.push(`/${cmd.function}`)
                                                compoHelp.push(`/${cmd.function} ${cmd.help}`)
                                            })
                                        }
                                        // Check if register inlines exist
                                        if (compo.register.inlines) {
                                            compo.register.inlines.map(iln => {
                                                iln.instance = compo.inlines[iln.function]
                                                iln.meta = compo.meta
                                                Compo.inline.push(iln)
                                            })
                                        }
                                        // Check if register message exist
                                        if (compo.register.messages) {
                                            compo.register.messages.map(msg => {
                                                msg.instance = compo.messages[msg.function]
                                                msg.meta = compo.meta
                                                Compo.message.push(msg)
                                            })
                                        }
                                        // Check if register callback Query exist
                                        if (compo.register.callbackQuery) {
                                            compo.register.callbackQuery.map(cbq => {
                                                cbq.instance = compo.callbackQuery[cbq.function]
                                                cbq.meta = compo.meta
                                                Compo.callbackQuery.push(cbq)
                                            })
                                        }

                                        // Check if register channel post exist
                                        if (compo.register.channelPost) {
                                            compo.register.channelPost.map(chp => {
                                                chp.instance = compo.channelPost[chp.function]
                                                chp.meta = compo.meta
                                                Compo.channelPost.push(chp)
                                            })
                                        }

                                        // Check if register scene exist
                                        if (compo.register.scene) {
                                            compo.register.scenes.map(sce => {
                                                sce.instance = compo.scenes[sce.name]
                                                sce.function = sce.function
                                                sce.meta = compo.meta
                                                Compo.scene.push(sce)
                                            })
                                        }

                                        compos.path.push(path.join(value, configValue.name))
                                        compos.list.push(`${configValue.name} \x1b[34m${configValue.version}\x1b[0m from \x1b[33m${value}\x1b[0m`)
                                        compos.name.push(configValue.name)
                                        compoInfo.push(`${value}/${configValue.name}@${configValue.version}`)
                                        Log.Log.debug(`${Lang.component.loaded[0]} ${configValue.name}@${configValue.version} ${Lang.component.loaded[1]} ${value}`)
                                    }

                                } 
                                catch (error) {
                                    Log.Log.fatal(error)
                                }

                            }
                            compos.info = compoInfo
                            Log.Log.info(Lang.component.readIn + compConfig.groupname + " " + Lang.component.component + ": " + `${compoInfo.length - 1}` + Lang.component.loaded[1] + value)
                            compoPair.push(`\n${Lang.component.readIn}${Lang.component.component}: *${compoInfo.length - 1}*`)
                        }
                    }
                    else { Log.Log.fatal(Lang.component.configFileInvalid + folder + "/config.json") }
                }
                else {
                    Log.Log.warning(Lang.component.noValidConfigFound[0] + " " + folder)
                    Log.Log.warning(Lang.component.noValidConfigFound[1])
                    return Compo
                }
            })
            return Compo
        } 
        catch (error) {
            Log.Log.fatal(error)
        }
    },
    list () {
        return compos
    },
    reload () {
        compos.path.forEach(item => {
            delete require.cache[require.resolve(path.join(path.join(__dirname, '/Components/'), item + ".js"))]
        })

        compoInfo = new Array()
        compoHelp = new Array()
        compoPair = new Array()
        compos = { list: [], path: [], info: [], name: [] }
        Compo = { command: [], inline: [], message: [], callbackQuery: [], channelPost: [] }

        this.Register.load()
    },
    unload (context) {

    }
}

let Interface = {
    Log,
    Nlp,
    Scene,
    Session: Session.Component,
    Telegram
}

let Data = {
    admin: config.admin
}

// Exports

exports.Compo = Compo
exports.compoPair = compoPair
exports.compoHelp = compoHelp
exports.compoInfo = compoInfo
exports.Interface = Interface
exports.Register = Register
exports.Data = Data
