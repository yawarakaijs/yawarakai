// Dependencies

const fs = require('fs')
const path = require('path')

// Local Packages

let Log = require('./log')
let config = require('../config.json')
let package = require('../package.json')

// Use-Ready Lang Files
// Scan all language files
const languageDir = path.join(__dirname, '/lang/')
let locales = new Array()

try {
    if(!fs.existsSync(languageDir)) {
        throw new Error(`Application Initialization Error: Cannot find the language folder under ${__dirname}`)
    }
    let files = fs.readdirSync(languageDir).filter(locale => locale.match(/^[a-z]{2}-[[A-Z]{2}\.json$/))

    if(files.length == 0) {
        throw new Error(`Application Initialization Error: Cannot find valid locale file under lang directory`)
    }
    // Iterial all folders to find the locale under it
    
    files.forEach(value => {
        if (fs.existsSync(languageDir + value)) {
            locales.push({locale: value.replace(".json", ""), content: require(languageDir + value)})
        }
    })
}
catch (err) {
    Log.Log.fatal(err)
    Log.Log.warning("Please double check the way you install the bot")
    Log.Log.warning("If you misdeleted the files, download and add into " + `${languageDir}`)
    Log.Log.warning("If you still get this error after added the locales mannualy, report a issue on " + `${package.bugs.url}`)
    process.exit(1)
}

let setLang = () => {
    let content =  locales.length < 2 ? locales.pop().content : locales.filter(item => item.locale == config.language).pop().content
    return content
}

let Lang = setLang()

module.exports = Lang