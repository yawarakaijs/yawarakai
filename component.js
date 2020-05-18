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

let compos = { list: [], path: [], info: [], name: [], entry: [] }
let compoInfo = new Array()
let compoHelp = new Array()
let compoPair = new Array()
let Compo = { scene: [], command: [], inline: [], message: [], callbackQuery: [], channelPost: [] }

// Body

let componentDir = config.development ? path.join(__dirname, "/Components/") : path.join(__dirname, '/node_modules/')

let Register = {
    load(extensionDir = componentDir) {
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

            let files = fs.readdirSync(extensionDir)
            let scopedFiles = files
            scopedFiles.forEach(value => {
                if (value.startsWith("@yawarakaijs") && fs.statSync(path.join(extensionDir, value)).isDirectory()) {
                    extensionDir = path.join(extensionDir, "/@yawarakaijs/")
                    files = fs.readdirSync(extensionDir)
                }
            })
            // Iterial all folders to find the config.json under it
            files.forEach(value => {
                let folder = path.join(extensionDir, value)
                let stats = fs.statSync(folder)

                if (value.startsWith("yawarakai") && stats.isDirectory()) {

                    // Get package info
                    if (!fs.existsSync(path.resolve(folder + "/package.json"))) {
                        Log.Log.warning("No package.json file found in folder name" + ` "${value}",` + " consider ignoring this folder")
                        return
                    }

                    delete require.cache[require.resolve(folder + "/package.json")]
                    let compoPackageInfo = require(folder + "/package.json")
                    let compoEntry = compoPackageInfo.main

                    // Get ready to print out
                    compoInfo.push(`${Lang.component.loaded[0]}`)

                    // Preinit
                    let compoName
                    let compoDisplayName
                    let compoDescription
                    let compoGroup
                    let compoVersion = compoPackageInfo.version
                    if (!fs.existsSync(path.resolve(folder + "/metadata.json"))) {
                        Log.Log.warning("No valid metadata.json found in component" + ` "${value}" ` + ", all names and alias will be processed as default value")
                        Log.Log.warning("If you are the developer of this component, you should consider add a metadata.json file for better context control.")

                        compoName = compoPackageInfo.name
                        compoDisplayName = compoPackageInfo.name
                        compoDescription = compoPackageInfo.description
                        compoGroup = compoPackageInfo.author
                    }
                    else {
                        delete require.cache[require.resolve(folder + "/metadata.json")]
                        let compoMetadataInfo = require(folder + "/metadata.json")

                        compoName = compoPackageInfo.name
                        compoDescription = compoMetadataInfo.description
                        compoDisplayName = compoMetadataInfo.displayName
                        compoGroup = compoMetadataInfo.groupName
                    }

                    compoPair.push(`\n*${compoDisplayName}*`)
                    compoPair.push(`${compoDescription}`)
                    compoPair.push(`${value}/${compoName}@${compoVersion}`)

                    // Get index
                    let compoPath = extensionDir + value + "/" + compoEntry

                    try {
                        if (fs.statSync(compoPath)) {
                            delete require.cache[require.resolve(compoPath)]
                            let compo = require(compoPath)

                            // Check if register commands exist
                            if (compo.register.commands) {
                                compo.register.commands.map(cmd => {
                                    if (cmd.function !== undefined) {
                                        cmd.instance = compo.commands[cmd.function]
                                        cmd.meta = compoMetadataInfo
                                        Compo.command.push(cmd)

                                        // Append the help text to compoHelp
                                        compoPair.push(`/${cmd.function}`)
                                        compoHelp.push(`/${cmd.function} ${cmd.help}`)
                                    }
                                })
                            }
                            // Check if register inlines exist
                            if (compo.register.inlines) {
                                compo.register.inlines.map(iln => {
                                    if (iln.function !== undefined) {
                                        iln.instance = compo.inlines[iln.function]
                                        iln.meta = compoMetadataInfo
                                        Compo.inline.push(iln)
                                    }
                                })
                            }
                            // Check if register message exist
                            if (compo.register.messages) {
                                compo.register.messages.map(msg => {
                                    if (msg.function !== undefined) {
                                        msg.instance = compo.messages[msg.function]
                                        msg.meta = compoMetadataInfo
                                        Compo.message.push(msg)
                                    }
                                })
                            }
                            // Check if register callback Query exist
                            if (compo.register.callbackQuery) {
                                compo.register.callbackQuery.map(cbq => {
                                    if (cbq.function !== undefined) {
                                        cbq.instance = compo.callbackQuery[cbq.function]
                                        cbq.meta = compoMetadataInfo
                                        Compo.callbackQuery.push(cbq)
                                    }
                                })
                            }

                            // Check if register channel post exist
                            if (compo.register.channelPost) {
                                compo.register.channelPost.map(chp => {
                                    if (chp.function !== undefined) {
                                        chp.instance = compo.channelPost[chp.function]
                                        chp.meta = compoMetadataInfo
                                        Compo.channelPost.push(chp)
                                    }
                                })
                            }

                            // Check if register scene exist
                            if (compo.register.scene) {
                                compo.register.scenes.map(sce => {
                                    if (sce.function !== undefined) {
                                        sce.instance = compo.scenes[sce.name]
                                        sce.function = sce.function
                                        sce.meta = compoMetadataInfo
                                        Compo.scene.push(sce)
                                    }
                                })
                            }

                            compos.path.push(path.join(value, compoName))
                            compos.entry.push(path.resolve(compoPath))
                            console.log(compos)
                            compos.list.push(`${value} \x1b[34m${compoVersion}\x1b[0m from \x1b[33m${value}\x1b[0m`)
                            compos.name.push(compoName)
                            compoInfo.push(`${compoGroup}/${compoName}@${compoVersion}`)
                            Log.Log.debug(`${Lang.component.loaded[0]} ${value}\x1b[34m@${compoVersion}\x1b[0m ${Lang.component.loaded[1]} \x1b[33m${value}\x1b[0m`)
                        }
                    }
                    catch (error) {
                        Log.Log.fatal(error)
                    }
                }
            })
            compos.info = compoInfo
            compoPair.push(`\n${Lang.component.readIn}${Lang.component.component}: *${compoInfo.length - 1}*`)
            return Compo
        }
        catch (error) {
            Log.Log.fatal(error)
        }
    },
    list() {
        return compos
    },
    reload() {
        compos.entry.forEach(item => {
            delete require.cache[require.resolve(item)]
        })

        compoInfo = new Array()
        compoHelp = new Array()
        compoPair = new Array()
        compos = { list: [], path: [], info: [], name: [] }
        Compo = { command: [], inline: [], message: [], callbackQuery: [], channelPost: [] }

        this.Register.load()
    },
    unload(context) {

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
    telegramAdmin: config.telegram.admin
}

// Exports

exports.Compo = Compo
exports.compoPair = compoPair
exports.compoHelp = compoHelp
exports.compoInfo = compoInfo
exports.Interface = Interface
exports.Register = Register
exports.Data = Data
