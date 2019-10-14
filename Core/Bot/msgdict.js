// Local Packages

// let Log = require('../log')
// let Message = require('./message')
// let NlpControl = require('./nlp').NlpControl

// Main

let tryMatch = (text) => {
    Dictionary.map((item, index) => {
        let loop = true
        let matchIdx = 0
        let result
        console.log(item)
        do {
            let regex = new RegExp(item.match[matchIdx].reg, item.match[matchIdx].mode)
            if(regex.test(text)) {
                console.log(/((悠月，)|())打开分析模式/gui.test(text))
                console.log(regex.test(text))
                console.log(regex)
                loop = false
                result = [item.reply, index]
                break
            }
        }
        while(loop)
    })
}

let callFunc = (context) => {
    Reflect.apply(Dictionary[context[0]].func[0], undefined, "null")
}

let Dictionary = [
    {
        match: [{reg: "((悠月，)|())打开分析模式", mode: "gui"}],
        reply: ["好的", "接下来乃说的话都可以得到一个 NLP 的分析"],
        func: [ "NlpControl.start()" ],
        callback: ""
    },
    {
        match: [{reg: "关闭分析模式", mode: "gui"}],
        reply: [],
        func: [],
        callback: ""
    }
]