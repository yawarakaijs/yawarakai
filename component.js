// Dependencies

let fs = require('fs')

// Local Files

let Log = require('./log')
let Core = require('./core')
let Lang = require('./lang').Lang

// Body

class Component {
    constructor(path) {
        console.log(path)
        this.compObj = require(path)
    }
    get() {
        return this.compObj
    }
}

let ComponentInterface = {
    Core: Core,
    Log: Log
}

let ComponentControl = {
    scan: () => {
        let baseDir = __dirname + "/Components/"
        var baseDirList = fs.readdirSync(baseDir)
        var childDirMap = new Map()
        baseDirList.forEach(element => {
            childDirMap.set([fs.readdirSync(baseDir + element + "/", {withFileTypes: true}).filter(dirent => !dirent.isDirectory()).map(dirent => dirent.name)], { "name": element, "path": baseDir + element})
        })
        return childDirMap
    },
    load: () => {
        let getPath = (key) => {
            var compConfig
            if(fs.existsSync(key.path + "/config.json")) {
                compConfig = require(key.path + "/config.json")
                if(compConfig.components) {
                    for (let [configKey, configValue] of Object.entries(compConfig.components)) {
                        var component = new Component(key.path + "/" + configValue.name)
                        ComponentList.append(component)
                    }
                }
                else { Log.Log.fatal(Lang.component.configFileInvalid + key.path + "/config.json") }
                Log.Log.debug(Lang.component.readIn + compConfig.groupname + Lang.component.loaded[1] + key.name)
            }
        }
        ComponentControl.scan().forEach(getPath)
       //delete require.cache
    }
}

let ComponentList = {
    append: (component) => {

        Log.Log.debug(Lang.component.loaded[0] + component.get().the.name + "@" + component.get().the.version + Lang.component.loaded[1] + component.get().the.groupNam)
    },
    enable: () => {

    },
    disable: () => {

    }
}

// Exports

exports.ComponentControl = ComponentControl
exports.ComponentInterface = ComponentInterface