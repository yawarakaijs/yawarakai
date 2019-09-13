// Dependencies

// Local Packages

let config = require('./config.json')

// Use-Ready Lang Files

const zhCNLang = require('./lang/zh-CN.json')
const enUSLang = require('./lang/en-US.json')

let Lang = {
    setLang: () => {
        var content;

        switch(config.language) {
            default:
                content = enUSLang
                break;
            case "zh-CN":
                content = zhCNLang
                break;
            case "en-US":
                content = enUSLang
                break;
        }
        return content;
    }
}

exports.Lang = Lang;