// Dependecies

const axios = require('axios')

let Compo = require('../../component')

// Component Method

let config = require('./config.json')

let main = {
    async wiki (query, lang) {
        return await axios.get(`https://${lang}.wikipedia.org/w/api.php`, {
            params: {
                format: "json",
                action: "opensearch",
                prop: "extracts",
                exintro: true,
                explaintext: true,
                search: query,
                limit: config.components.wiki.limit,
            }
        }).then(res => {
            if (res.data instanceof Array && res.data.length === 4 && res.data[0] === query) {
                return {
                    titles: res.data[1],
                    urls: res.data[3]
                }
            } else {
                return undefined
            }
        }).then(async res => {
            if (res.titles instanceof Array && res.titles.length > 0 && 
                res.urls instanceof Array && res.urls.length === res.titles.length) {
                let result = new Array()
                for (var i = 0; i < res.titles.length; i++) {
                    const resp = await axios.get(`https://${lang}.wikipedia.org/w/api.php`, {
                        params: {
                            format: "json",
                            action: "query",
                            prop: "extracts",
                            exintro: true,
                            explaintext: true,
                            redirects: 1,
                            titles: res.titles[i]
                        }
                    })
                    if (resp.data.hasOwnProperty("query")) {
                        let pages = resp.data.query.pages
                        if (!pages.hasOwnProperty("-1")) {
                            let pageNum = Object.keys(pages).map(item => item.match(/\d+/)).pop()
                            result.push({
                                lang: lang,
                                title: pages[pageNum].title,
                                caption: pages[pageNum].extract.slice(0, 25) + "...",
                                content: `*${pages[pageNum].title}* [@Wikipedia](https://${lang}.wikipedia.org/wiki/${query})` + "\n" + pages[pageNum].extract,
                                url: res.urls[i]
                            })
                        }
                    }
                }
                return result
            } else {
                return undefined
            }
        }).catch(err => {
            return err
        })
    }
}

// Change the Component Name according to the config.json

exports.meta = config.components.wiki

// Inner

exports.commands = {
    async main () {

    }
}

exports.inlines = {
    async main (ctx) {
        let globalPattern = /(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/\/=]*)/gumi
        if (!globalPattern.test(ctx.inlineQuery.query) && ctx.inlineQuery.query != "") {
            Compo.Interface.Log.Log.info(`${ctx.from.first_name} 发起了 Wikipedia 查询 ${ctx.inlineQuery.query}`)
            let data = await main.wiki(ctx.inlineQuery.query, "zh").catch(err => {
                this.DiagnosticLog.fatal(err)
                return undefined
            })
            if (data instanceof Error) {
                this.DiagnosticLog.fatal(err)
                return undefined
            }
            else if (data != undefined) {
                return data.map(entry => {
                    return {
                        type: "article",
                        id: ctx.inlineQuery.id,
                        title: `${entry.title}`,
                        description: entry.caption,
                        thumb_url: "https://i.loli.net/2019/11/06/Om7oWzkAMRZl5sc.jpg",
                        input_message_content: { message_text: `${entry.content}`, parse_mode: "Markdown" },
                        reply_markup: {
                            inline_keyboard: [[
                                {
                                    text: "Wikipedia Page",
                                    url: `${entry.url}`,
                                }
                            ]]
                        }
                    }
                })
            }
            else {
                data = await main.wiki(ctx.inlineQuery.query, "en")
                if (data != undefined) {
                    return data.map(entry => {
                        return {
                            type: "article",
                            id: ctx.inlineQuery.id,
                            title: `${entry.title}`,
                            description: entry.caption,
                            thumb_url: "https://i.loli.net/2019/11/06/Om7oWzkAMRZl5sc.jpg",
                            input_message_content: { message_text: `${entry.content}`, parse_mode: "Markdown" },
                            reply_markup: {
                                inline_keyboard: [[
                                    {
                                        text: "Wikipedia Page",
                                        url: `${entry.url}`,
                                    }
                                ]]
                            }
                        }
                    })
                }
            }
            return undefined
        }
        return undefined
    }
}

exports.messages = {
    async main (ctx) {

    }
}

exports.callbackQuery = {
    async main () {

    }
}

// Register

exports.register = {
    // As the example to Yawarakai Compos
    commands: [
        // {
        //     // function: 'main'
        // }
    ],
    inlines: [
        {
            function: "main"
        }
    ],
    messages: [
        // {
        //     // function: 'main'
        // }
    ],
    callbackQuery: [
        // {
        //     function: 'main'
        // }
    ]
}