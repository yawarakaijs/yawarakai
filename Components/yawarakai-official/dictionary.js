// Dependecies

let Compo = require('../../component')

// Component Method

let config = require('./config.json')
let hujiang = require('./lib/dictlib')

// Header

exports.meta = config.components.dictionary
let thumb = "https://i.loli.net/2019/10/04/eNxTQaftWrh7Lsd.jpg"

// Main

let main = {
    c2j: async (query) => {
        return hujiang.search(query, 'cn', 'jp').then(res => {
            return res.wordEntries[0].dictEntrys[0].partOfSpeeches[0].definitions
        }).catch(err => {
            Compo.Interface.Log.Log.fatal(err)
        })
    },

    j2c: async (query) => {
        return hujiang.search(query, 'jp', 'cn').then(res => {
            return res.wordEntries[0].dictEntrys[0].partOfSpeeches[0].definitions
        }).catch(err => {
            Compo.Interface.Log.Log.fatal(err)
        })
    },
    answer: (ctx, query, result, middleWord) => {
        var data = {
            type: "article",
            id: ctx.inlineQuery.id,
            title: `${query} 释义`,
            description: result,
            thumb_url: thumb,
            input_message_content: { message_text: `${query} 的${middleWord}是 ${result}`}
        }
        return data
    }
}

var any = {}

// Exports

exports.commands = {

}

exports.inlines = {
    main: async function (ctx) {
        // Send in
        var queryPlain = ctx.inlineQuery.query
        var defination
        var defs = []

        // let global = /((^(中文|日语|日文|汉语)((的)|()))(.*)|(^(.*)((的)|()))(中文|日语|汉语|日文)((是什么呢|是什么|是什么意思|怎么说)|()))$/gum
        let c2jpattern = /((^(日文|日语)((的)|()))(.*)|(^(.*)((的)|()))(日文|日语)((是什么呢|是什么|是什么意思|怎么说)|()))$/gum
        let j2cpattern = /((^(中文|汉语)((的)|()))(.*)|(^(.*)((的)|()))(中文|汉语)((是什么呢|是什么|是什么意思|怎么说)|()))$/gum
        // Translate to Japanese
        if (c2jpattern.test(queryPlain)) {
            var stepone = queryPlain.replace(/^(日文|日语)(的|())\s{0,}/gu, "")
            var steptwo = stepone.replace(/(是什么|是什么呢|怎么说|怎么写|怎么翻译|)(\?|)$/gu, "")

            Compo.Interface.Log.Log.info(`${ctx.from.first_name} 发起了单词查询 (中文至日文)：${steptwo}`)
            return main.c2j(steptwo).then(res => {
                defination = res
                defination.map(element => {
                    defs.push(element.value)
                })
                var result = defs.join(" | ")
                any = main.answer(ctx, steptwo, result, "日语")
                return any
            }).catch(err => {
                Compo.Interface.Log.Log.fatal(err)
            })
        }

        // Translate to Chinese
        if (j2cpattern.test(queryPlain)) {
            var stepone = queryPlain.replace(/^(中文|汉语)(的|())\s{0,}/gu, "")
            var steptwo = stepone.replace(/(是什么|是什么呢|怎么说|怎么写|怎么翻译|)(\?|)$/gu, "")
            Compo.Interface.Log.Log.info(`${ctx.from.first_name} 发起了单词查询 (日文至中文)：${steptwo}`)
            return main.j2c(steptwo).then(res => {
                defination = res
                defination.map(element => {
                    defs.push(element.value)
                })
                var result = defs.join(" | ")
                any = main.answer(ctx, steptwo, result, "中文")
                return any
            }).catch(err => {
                Compo.Interface.Log.Log.fatal(err)
            })

        }
    }
}

exports.register = {
    // As the example to Yawarakai Compos
    commands: [
        {
            cmdReg: 'c2j'
        },
        {
            cmdReg: "j2c"

        }
    ],
    inlines: [
        {
            ilnReg: "main"
        }
    ],
    messages: [
        {

        }
    ]
}