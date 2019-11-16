const axios = require("axios")
const config = require("./config.json")
const Compo = require("../../component")
const fs = require('fs')
const path = require('path')
const NodeID3 = require('node-id3')
const http = require('http')
const https = require('https')

let baseDir = __dirname.replace(/((\/)|(\\))(Components)(((\/)|(\\))(yawarakai-official))/gu, "")
// io.js
// let cacheDir = path.join(baseDir, "/cache")
// let dataDir = path.join(cacheDir, "/data")
// let musicDir = path.join(cacheDir, "/music")

// if (!fs.existsSync(cacheDir)) {
//     fs.mkdirSync(cacheDir)
// }
// if (!fs.existsSync(dataDir)) {
//     fs.mkdirSync(dataDir)
// }
// if (!fs.existsSync(musicDir)) {
//     fs.mkdirSync(musicDir)
// }

let main = {
    /**
     * Retrives the song source url back
     * @param {*} params    - Object of params input as id, type, userid
     * @param {*} bitrate   - Fixed number optionally set as the bitrate
     * @return                Array that contains only one object as the audio inline type
     */
    song: async function (params, bitrate = 320000) {
        let baseUrl = "https://api.yutsuki.moe/cloudmusic"
        return Promise.all([
            axios.get(baseUrl + '/song/url', { params: { id: params.id, br: bitrate } }),
            axios.get(baseUrl + '/song/detail', { params: { ids: params.id } })
        ]).then(resArray => {
            let authorText = new Array()
            let authorTag = new Array()
            let authorInfo = resArray[1].data.songs[0].ar
            authorInfo.forEach(item => authorText.push(item.name))
            authorInfo.forEach(item => authorTag.push("#"+item.name.replace(" ","")))
            authorText = authorText.join(" / "),
            authorTag = authorTag.join(" ")
            let resultText = resArray[1].data.songs[0].name + " - " + authorText

            // fileid
            let FUID = new Array()
            for (let i = 0; i < 3; i++) {
                FUID.push(Math.floor(Math.random() * Math.floor(9)))
            }
            FUID = FUID.join("")
            FUID = "2523" + new Date().getTime() + FUID

            // song file
            return Promise.all([
                // main.getSong(resArray[0].data.data[0].url, FUID),
                // main.getAlbumPic(resArray[1].data.songs[0].al.picUrl, FUID),
                axios.get(baseUrl + '/album', { params: { id: resArray[1].data.songs[0].al.id } })
            ]).then(dataArray => {
                let infoContainer = {}
                // infoContainer["song"] = resArray[1].data.songs[0]
                infoContainer["album"] = dataArray[0].data.album

                let data = [{
                    type: "audio",
                    id: params.id,
                    title: resArray[1].data.songs[0].name,
                    performer: authorText,
                    audio_url: resArray[0].data.data[0].url,
                    caption: authorText + "\n" + dataArray[0].data.album.name + `\n#yawarakai #${authorTag} #s${params.id}`,
                    reply_markup: {
                        inline_keyboard: [[
                            {
                                text: "Open in CloudMusic",
                                url: `https://m.music.163.com/m/applink/?scheme=orpheus://song/${params.id}`
                            }
                        ]]
                    }
                }]
                return data

            }).catch(err => Compo.Interface.Log.Log.fatal(err))
        }).catch(err => {
            err["message"] = "Component Error: Yutsuki API failed to respond the request\nProbably could be the issue of Netease, you should report this issue to the API server maintainer"
        })
    },
    /**
     * 
     * @param {*} params 
     */
    album: async function (params) {

    },
    playlist: async function (params) {
        let baseUrl = "https://api.yutsuki.moe/cloudmusic"
        return axios.get(baseUrl + '/playlist/detail', { params: { id: params.id } }).then(res => {
            if (res.data.code != 200) {
                return undefined
            }
            else {
                let playlistInfo = res.data.playlist
                let trackData = playlistInfo.tracks
                let trackResult = new Array()
                trackData.forEach(item => {
                    let authorText = new Array()
                    item.ar.forEach(item => authorText.push(item.name))
                    authorText = authorText.join("/")
                    let trackObj = { id: item.id, name: item.name, artist: authorText, album: item.al.name }
                    trackResult.push(trackObj)
                })
                let description = playlistInfo.description != null ? /\s+?.*/gumi.test(playlistInfo.description) ? playlistInfo.description : "_无简介_" : "_无简介_"
                let tag = playlistInfo.tags.join(" | ") == "" ? "_无标签_" : playlistInfo.tags.join(" | ")
                let data = {
                    picUrl: playlistInfo.coverImgUrl,
                    text: `*${playlistInfo.name}*\n${playlistInfo.creator.nickname}\n曲目: ${playlistInfo.tracks.length} 首\n标签: ${playlistInfo.tags.join(" | ")}\n简介: ${description}\n#yawarakai #${params.id}`,
                    tracks: trackResult
                }
                return data
            }
        })
    },
    /**
     * Donwload the given music source url as the needed file format
     * @param {*} url       - String of the required source to download
     * @param {*} fileId    - Number of the unique file id
     * @returns `             String of the full file name
     */
    getSong: function (url, fileId) {
        return new Promise((resolve, reject) => {
            let extName = url.replace(/(https?:\/\/)(.*\/)/gui, "").split(".")[1]
            let fileName = fileId + "." + extName

            let file = fs.createWriteStream("./cache/music/" + fileName)
            let request = http.get(url, function (response) {
                if (response.statusCode != 200) {
                    reject()
                }
                response.pipe(file)
                resolve(fileName)
            })
        })
    },
    /**
     * Download the given picture source url as the needed file format
     * @param {*} url       - String of the required source to download
     * @param {*} fileId    - Number of the unique file id
     * @returns               String of the full file name
     */
    getAlbumPic: function (url, fileId) {
        return new Promise((resolve, reject) => {
            let extName = url.replace(/(https?:\/\/)(.*\/)/gui, "").split(".")[1]
            let fileName = fileId + "." + extName

            let file = fs.createWriteStream("./cache/data/" + fileName)
            let request = https.get(url, function (response) {
                if (response.statusCode != 200) {
                    reject()
                }
                response.pipe(file)
                resolve(fileName)
            })
        })
    },
    writeTag: function (audioFile, picFile, info) {
        return new Promise((resolve, reject) => {
            console.log(NodeID3.read(path.join(baseDir, "/cache/data/", audioFile)))
            let tag = {
                album: "",
                composer: "",
                genre: "",
                date: "",
                time: "",
                title: "",
                subtitle: "",
                artist: "",
                publisher: "",
                trackNumber: "",
                recordingDates: "",
                size: "",
                year: "",
                image: {
                    mime: "png/jpeg" / undefined,
                    type: {
                        id: 3,
                        name: "front cover"
                    },
                    description: "image description",
                    imageBuffer: null
                }
            }
        })
    },
    /**
     * Parse the types of the given string and return the final params
     * @param {*} link      - String of the url that needed to be parsed
     * @returns               Object of the params that contains type, id, userid
     */
    parseArgs: function (link) {
        // type one
        // prefix cut
        let domainName = /((^https?:\/\/)|(^))(music.163.com)/gumi
        let desktopVersionPrefix = /(\/#)(\/m)?/gumi
        let categoriesPrefix = /\/((song)|(album)|(playlist))/gumi
        // REPLACE
        link = link.replace(domainName, "")
        link = link.replace(desktopVersionPrefix, "")

        let result

        if (link.startsWith("/song")) {
            link = link.replace(categoriesPrefix, "")
            return main.paramsDiffer(link, "song")
        }
        else if (link.startsWith("/album")) {
            link = link.replace(categoriesPrefix, "")
            return main.paramsDiffer(link, "album")
        }
        else if (link.startsWith("/playlist")) {
            link = link.replace(categoriesPrefix, "")
            return main.paramsDiffer(link, "playlist")
        }

        let apiName = /(musicshare:\/\/)/gui

        if (link.startsWith("playlist") || link.startsWith("song") || link.startsWith("album")) {
            link = link.replace(apiName, "")
            return main.paramsDiffer(link, "callback")
        }

        return undefined
    },
    /**
     * Parse the params based on the preprocessed string and retrives the params as a object
     * @param {*} src       - String of the source that is needed to be parsed
     * @param {*} type      - String of the source type that is differed to different processing categories
     * @returns               Object of the retrived data that contains type, id, userid
     */
    paramsDiffer: function (src, type) {
        let params = {}
        let idCheck = /^id=/gu
        let useridCheck = /userid=/gu

        if (src.startsWith("?")) {
            src = src.replace("?", "")
            if (src.includes("&")) {
                src = src.split("&")
                src.forEach(param => {
                    params["type"] = type
                    if (idCheck.test(param)) { params["id"] = parseInt(param.replace(idCheck, "")) }
                    if (useridCheck.test(param)) { params["userid"] = parseInt(param.replace(useridCheck, "")) }
                })
                return params
            }
            else if (idCheck.test(src)) {
                params["type"] = type
                params["id"] = parseInt(src.replace(idCheck, ""))
                return params
            }
        }

        else if (src.startsWith("/")) {
            src = src.replace("/", "")
            if (src.includes("/?")) {
                src = src.split("/?")
                src.forEach(param => {
                    params["type"] = type
                    if (/^\d+/gu.test(param)) { params["id"] = parseInt(param) }
                    if (useridCheck.test(param)) { params["userid"] = parseInt(param.replace(useridCheck, "")) }
                })
                return params
            }
            else if (/^(\d+)(\/)?/gu) {
                params["type"] = type
                params["id"] = parseInt(src.replace("/", ""))
                return params
            }
        }

        else if (src.startsWith("callback")) {
            let typeCheck = /^.*\?/i
            let callbackType = src.match(typeCheck).slice(0, -1)
            src = src.replace(typeCheck, "")
            if (src.includes) {
                src = src.split("&")
                src.forEach(item => {
                    params["type"] = callbackType
                    if (idCheck.test(item)) { params["id"] = parseInt(item.replace(idCheck, "")) }
                    if (/^pageid=/gi.test(item)) { params["pageid"] = parseInt(item.replace(idCheck, "")) }
                    if (/([a-z]*)(?!((\.)\=))/gi.test(item)) { params[item.match(/([a-z]*)(?!((\.)\=))/i)] = true }
                })
                return params
            }
            else {
                params["type"] = callbackType
                if (idCheck.test(src[0])) { params["id"] = parseInt(src[0].replace(idCheck, "")) }
                return params
            }
        }

    }
}

exports.meta = config.components.musicshare

exports.commands = {
    netease: async function (context) {

    },
    playlist: async function (context) {
        let urlCheck = /((https?)?((:\/\/))?)(music.163.com)(\/)(#\/)?(m\/)?(playlist)((\/\d+)|(\?id=\d+))((&userid=\d+)|(\/\?userid=\d+)|(\/\d+\/(\?userid=\d+)?)|(\/\d+\/)|(\/))?/gui
        let message = context.ctx.message.text
        let link = new Array()
        if (context.args[0]) {
            context.args.forEach(item => {
                link.push(item.match(urlCheck))
            })
            link = link.join("")
            if (link == "") {
                return "使用方法有误哦！\n/playlist 歌单链接 或者 整个分享文本\n如果想要搜索关键词可以使用 /netease playlist 关键词"
            }
            else {
                let params = main.parseArgs(link)
                let data = { text: "", extra: null }
                let result = await main.playlist(params)
                if (result == undefined) {
                    return undefined
                }
                else {
                    let keys = new Array()
                    for (let i = 0; i < 6; i++) {
                        let key = [{
                            text: `${result.tracks[i].name} - ${result.tracks[i].artist}`,
                            callback_data: "musicshare://playlist/song?id=" + result.tracks[i].id,
                        }]
                        keys.push(key)
                    }
                    keys.push([
                        {
                            text: "<",
                            callback_data: "musicshare://playlist?id=" + params.id + "&pagedown"
                        },
                        {
                            text: 1,
                            callback_data: "musicshare://playlist?id=" + params.id + "&pageid=" + 1
                        },
                        {
                            text: ">",
                            callback_data: "musicshare://playlist?id=" + params.id + "&pageup"
                        }
                    ])
                    this.telegram.sendMessage(context.ctx.from.id, result.text, {
                        reply_markup: {
                            inline_keyboard: keys
                        },
                        parse_mode: "Markdown"
                    })
                }
            }
        }
        else {
            return undefined
        }
    }
}

exports.inlines = {
    main: async function (ctx) {
        let globalUrlPattern = /((https?)?((:\/\/))?)(music.163.com)(\/)(#\/)?(m\/)?(song|album|playlist)((\/\d+)|(\?id=\d+))((&userid=\d+)|(\/\?userid=\d+)|(\/\d+\/(\?userid=\d+)?)|(\/\d+\/)|(\/))?/gui
        let link = ctx.inlineQuery.query

        if (globalUrlPattern.test(link)) {
            link = link.match(globalUrlPattern)[0]
            let params = main.parseArgs(link)
            if (params.type == "song") {
                Compo.Interface.Log.Log.info(`${ctx.from.first_name} 请求歌曲来自链接: ${link}`)

                let data = await main.song(params)
                if (data[0].audio_url == null) {
                    return [{
                        type: "article",
                        id: params.id,
                        title: `${data[0].title}`,
                        description: "我们找到了曲目，但是对不起呢，歌曲暂不可用",
                        thumb_url: "https://i.loli.net/2019/11/13/dQDxC4Nv91VYK2E.jpg",
                        input_message_content: { message_text: `${data[0].title}\n${data[0].performer}\n实在是很抱歉呢，这个歌曲暂不可用，但是可以试试在 App 中打开\n#yawarakai #${params.id}` },
                        reply_markup: {
                            inline_keyboard: [[{
                                text: "Open in App",
                                url: `https://m.music.163.com/m/applink/?scheme=orpheus://song/${params.id}`
                            }]]
                        }
                    }]
                }
                else {
                    return data
                }

            }
            else if (params.type == "album") {
                Compo.Interface.Log.Log.info(`${ctx.from.first_name} 请求查询专辑来自链接: ${link}`)
                return await main.album(params)
            }
            else if (params.type == "playlist") {
                Compo.Interface.Log.Log.info(`${ctx.from.first_name} 请求查询歌单来自链接: ${link}`)
                return await main.playlist(params)
            }
        }
        return undefined
    }
}

exports.messages = {
    main: async function (ctx) {
        let searchUser = /搜索用户/gui
    }
}

exports.callbackQuery = {
    main: async function (ctx) {
        console.log(ctx.update)
        let callbackData = ctx.update.callback_query
        let params = main.parseArgs(callbackData.data)
        console.log(params)

        return "Got"
    }
}

exports.register = {
    // As the example to Yawarakai Compos
    commands: [
        {
            function: 'netease'
        },
        {
            function: 'playlist'
        }
    ],
    inlines: [
        {
            function: "main"
        }
    ],
    messages: [
        // {
        // function: 'main'
        // }
    ],
    callbackQuery: [
        {
            function: 'main'
        }
    ]
}
