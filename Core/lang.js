// Dependencies

const fs = require('fs')
const path = require('path')

// Local Packages

let Log = require('./log')
let config = require('../config.json')

// Use-Ready Lang Files
// Scan all language files

const languageDir = path.join(__dirname, '/lang/')

if(!fs.existsSync(languageDir)) {
    // resolve folder not found
}
var files = fs.readdirSync(languageDir).filter(locale => locale.match(/^[a-z]{2}-[[A-Z]{2}\.json$/))
// Iterial all folders to find the locale under it
let locales = new Array()

files.forEach(value => {
    if (fs.existsSync(languageDir + value)) {
        locales.push({locale: value.replace(".json", ""), content: require(languageDir + value)})
    }
})

let setLang = () => {
    let content = locales.filter(item => item.locale == config.language).pop().content
    return content
}

let Lang = setLang()

module.exports = Lang