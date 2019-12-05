const axios = require("axios")
const config = require("./config.json")
const Compo = require("../../component")
const fs = require('fs')
const path = require('path')
const http = require('http')
const https = require('https')
const NodeID3 = require('node-id3')

let baseDir = __dirname.replace(/((\/)|(\\))(Components)(((\/)|(\\))(yawarakai-official))/gu, "")

// io.js
let cacheDir = path.join(baseDir, "/cache")
let dataDir = path.join(cacheDir, "/data")
let musicDir = path.join(cacheDir, "/music")

if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir)
}
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir)
}
if (!fs.existsSync(musicDir)) {
    fs.mkdirSync(musicDir)
}

let main = {
    /**
     * Retrives the song source url back
     * @param {*} params    - Object of params input as id, type, userid
     * @param {*} bitrate   - Fixed number optionally set as the bitrate
     * @return                Array that contains only one object as the audio inline type
     */
    song: async function (params, bitrate = 320000, type = "inline") {
        let baseUrl = "https://api.yutsuki.moe/cloudmusic"
        return Promise.all([
            axios.get(baseUrl + '/song/url', { params: { id: params.id, br: bitrate } }),
            axios.get(baseUrl + '/song/detail', { params: { ids: params.id } })
        ]).then(resArray => {
            let authorText = new Array()
            let authorTag = new Array()
            let authorInfo = resArray[1].data.songs[0].ar
            authorInfo.forEach(item => authorText.push(item.name))
            authorInfo.forEach(item => authorTag.push("#" + item.name.replace(" ", "")))
            authorText = authorText.join(" / "),
                authorTag = authorTag.join(" ")
            let resultText = resArray[1].data.songs[0].name + " - " + authorText

            if (!fs.existsSync(cacheDir)) {
                fs.mkdirSync(cacheDir)
            }
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir)
            }
            if (!fs.existsSync(musicDir)) {
                fs.mkdirSync(musicDir)
            }

            // fileid
            let FUID = new Array()
            for (let i = 0; i < 3; i++) {
                FUID.push(Math.floor(Math.random() * Math.floor(9)))
            }
            FUID = FUID.join("")
            FUID = "2523" + new Date().getTime() + FUID

            if (resArray[0].data.data[0].url == null) { return undefined }

            // song file
            if (type == "inline") {
                return Promise.all([
                    axios.get(baseUrl + '/album', { params: { id: resArray[1].data.songs[0].al.id } })
                ]).then(async (dataArray) => {
                    
                    let titleAlias = resArray[1].data.songs[0].alia[0] == undefined ? "" : ` (${resArray[1].data.songs[0].alia[0]})`
                    let albumAlias = dataArray[0].data.album.alias[0] == undefined ? "" : ` (${dataArray[0].data.album.alias[0]}))`

                    let data = {
                        inline: [{
                            type: "audio",
                            id: params.id,
                            title: resArray[1].data.songs[0].name,
                            performer: authorText,
                            audio_url: resArray[0].data.data[0].url,
                            caption: resArray[1].data.songs[0].name + titleAlias + "\n" + authorText + "\n" + dataArray[0].data.album.name + albumAlias + `\n#yawarakai #s${params.id}`,
                            reply_markup: {
                                inline_keyboard: [[
                                    {
                                        text: "Open in CloudMusic",
                                        url: `https://m.music.163.com/m/applink/?scheme=orpheus://song/${params.id}`
                                    }
                                ]]
                            }
                        }],
                        track: {
                            id: resArray[1].data.songs[0].al.id
                        }
                    }

                    return data

                }).catch(err => {
                    //err["message"] = "Component Error: Yutsuki API failed to respond the request\nProbably could be the issue of Netease, you should report this issue to the API server maintainer"
                    return err
                })
            }
            else if (type == "callback") {
                return Promise.all([
                    axios.get(baseUrl + '/album', { params: { id: resArray[1].data.songs[0].al.id } }),
                    main.getSong(resArray[0].data.data[0].url, FUID),
                    main.getAlbumPic(resArray[1].data.songs[0].al.picUrl, FUID)
                ]).then(async (dataArray) => {

                    let titleAlias = resArray[1].data.songs[0].alia[0] == undefined ? "" : ` (${resArray[1].data.songs[0].alia[0]})`
                    let albumAlias = dataArray[0].data.album.alias[0] == undefined ? "" : ` (${dataArray[0].data.album.alias[0]}))`

                    let info = {
                        track: resArray[1].data.songs[0],
                        album: dataArray[0].data.album
                    }

                    let writeSuccess = await main.writeTag(dataArray[1], dataArray[2], info)
                    if (!writeSuccess) return undefined
                    else {

                        fs.renameSync(writeSuccess, path.join(baseDir, "/cache/music/", dataArray[1]))

                        let srcDir = path.join(baseDir, "/cache/data")
                        fs.readdir(srcDir, (err, files) => {
                            if (err) throw err

                            for (let file of files) {
                                fs.unlink(path.join(srcDir, file), err => {
                                    if (err) throw err
                                })
                            }
                        })
                    }

                    let data = {
                        callback: {
                            type: "audio",
                            title: resArray[1].data.songs[0].name,
                            performer: authorText,
                            audio: resArray[0].data.data[0].url,
                            caption: resArray[1].data.songs[0].name + titleAlias + "\n" + authorText + "\n" + dataArray[0].data.album.name + albumAlias + `\n#yawarakai #s${params.id}`,
                            thumb: dataArray[0].data.album.picUrl,
                            parse_mode: "Markdown"
                        },
                        track: {
                            id: resArray[1].data.songs[0].al.id
                        },
                        file: {
                            audioFile: dataArray[1],
                            picFile: dataArray[2],
                            audio: path.join(baseDir, "/cache/music/", dataArray[1])
                        }
                    }

                    return data

                }).catch(err => {
                    //err["message"] = "Component Error: System failed to process file\nProbably could be the issue of Netease, you should report this issue to the API server maintainer"
                    return err
                })
            }
        }).catch(err => {
            //err["message"] = "Component Error: Yutsuki API failed to respond the request\nProbably could be the issue of Netease, you should report this issue to the API server maintainer"
            return err
        })
    },
    /**
     * 
     * @param {*} params 
     */
    album: async function (params) {
        let baseUrl = "https://api.yutsuki.moe/cloudmusic"
        return axios.get(baseUrl + '/album', { params: { id: params.id } }).then(res => {

            if (res.data.code != 200) {
                return undefined
            }
            else {
                let albumInfo = res.data.album
                let trackData = res.data.songs
                let trackResult = new Array()

                trackData.forEach(item => {
                    let authorText = new Array()
                    item.ar.forEach(item => authorText.push(item.name))
                    authorText = authorText.join("/")
                    let trackObj = { id: item.id, name: item.name, artist: authorText, album: item.al.name }
                    trackResult.push(trackObj)
                })

                let albumAlias = albumInfo.alias[0] == undefined ? "" : " " + albumInfo.alias[0]
                let albumArtist = new Array()

                albumInfo.artists.forEach(item => albumArtist.push(item.name))
                albumArtist.join("/")

                let description = albumInfo.description != null ? /\s+?.+/gumi.test(albumInfo.description) ? albumInfo.description : "_无简介_" : "_无简介_"
                let data = {
                    picUrl: albumInfo.picUrl,
                    text: `*${albumInfo.name}${albumAlias}*\n${albumArtist}\n曲目: ${albumInfo.songs.length} 首\n简介: ${description}\n#yawarakai #p${params.id}`,
                    tracks: trackResult
                }
                return data
            }
        })
    },
    /**
     * Retrive the playlist data as the object based on the params provides
     * @param {*} params    - Object of params input as id, type, userid
     */
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

                let description = playlistInfo.description != null ? /\s+?.+/gumi.test(playlistInfo.description) ? playlistInfo.description : "_无简介_" : "_无简介_"
                let tag = playlistInfo.tags.join(" | ") == "" ? "_无标签_" : playlistInfo.tags.join(" | ")
                let data = {
                    picUrl: playlistInfo.coverImgUrl,
                    text: `*${playlistInfo.name}*\n${playlistInfo.creator.nickname}\n曲目: ${playlistInfo.tracks.length} 首\n标签: ${tag}\n简介: ${description}\n#yawarakai #p${params.id}`,
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

            let file = fs.createWriteStream(baseDir + "/cache/data/" + fileName)
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

            let file = fs.createWriteStream(baseDir + "/cache/data/" + fileName)
            let request = https.get(url, function (response) {
                if (response.statusCode != 200) {
                    reject()
                }
                response.pipe(file)
                resolve(fileName)
            })
        })
    },
    writeTag: async function (audioFile, picFile, info) {
        return new Promise((resolve, reject) => {
            let file = path.join(baseDir, "/cache/data/", audioFile)
            let image = fs.readFileSync(path.join(baseDir, "/cache/data/" + picFile))

            let artist = new Array()
            info.track.ar.forEach(item => {
                artist.push(item.name)
            })

            artist = artist.join("/")
            let time = info.track.publishTime
            let year = new Date(time).getFullYear()

            let tag = {
                album: info.album.name,
                title: info.track.name,
                artist: artist,
                image: image,
                year: year,
                trackNumber: info.track.no,
                partOfSet: info.track.cd,
                composer: artist
            }

            NodeID3.write(tag, file, (err, buffer) => {
                if (err) {
                    reject(success)
                }
                else {
                    let result = NodeID3.read(file)
                    resolve(file)
                }
            })

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

        let apiName = /musicshare:\/\//gui
        link = link.replace(apiName, "")
        if (link.startsWith("playlist") || link.startsWith("song") || link.startsWith("album") || link.startsWith("action")) {
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

        else if (type == "callback") {
            src = src.split("?")
            callbackType = src[0]
            src = src[1].split("&")
            params["type"] = callbackType
            src.forEach(item => {
                item = item.split("=")
                params[item[0]] = /^\d+/.test(item[1]) ? parseInt(item[1]) : item[1]
            })
            return params
        }

    },
    pageUp: function (itemNum, dataArray, params, type) {
        let desPage = params.pid - 1

        let end = itemNum * desPage
        let start = end - itemNum

        let keys = new Array()
        let isTop = desPage == 1
        for (let i = start; i < end; i++) {
            let key = [{
                text: `${dataArray[i].name} - ${dataArray[i].artist}`,
                callback_data: "musicshare://song?id=" + dataArray[i].id
            }]
            keys.push(key)
        }
        if (isTop) {
            keys.push([
                {
                    text: desPage,
                    callback_data: `musicshare://null?pageid=${desPage}&id=${params.id}`
                },
                {
                    text: ">",
                    callback_data: `musicshare://action?action=down&pid=${desPage}&q=${params.q}&id=${params.id}`
                }
            ])
        }
        else {
            keys.push([
                {
                    text: "<",
                    callback_data: `musicshare://action?action=up&pid=${desPage}&q=${params.q}&id=${params.id}`
                },
                {
                    text: desPage,
                    callback_data: `musicshare://null?pageid=${desPage}&id=${params.id}`
                },
                {
                    text: ">",
                    callback_data: `musicshare://action?action=down&pid=${desPage}&q=${params.q}&id=${params.id}`
                }
            ])
        }
        return keys
    },
    pageDown: function (itemNum, dataArray, params, type) {
        let desPage = params.pid + 1

        let end = itemNum * desPage
        let start = end - itemNum
        let keys = new Array()
        let length = dataArray.length > end ? end : dataArray.length
        let isEnd = dataArray.length > end ? false : true

        for (let i = start; i < length; i++) {
            let key = [{
                text: `${dataArray[i].name} - ${dataArray[i].artist}`,
                callback_data: "musicshare://song?id=" + dataArray[i].id
            }]
            keys.push(key)
        }

        if (isEnd) {
            keys.push([
                {
                    text: "<",
                    callback_data: `musicshare://action?action=up&pid=${desPage}&q=${params.q}&id=${params.id}`
                },
                {
                    text: desPage,
                    callback_data: `musicshare://null?pageid=${desPage}&id=${params.id}`
                }
            ])
        }
        else {
            keys.push([
                {
                    text: "<",
                    callback_data: `musicshare://action?action=up&pid=${desPage}&q=${params.q}&id=${params.id}`
                },
                {
                    text: desPage,
                    callback_data: `musicshare://null?pageid=${desPage}&id=${params.id}`
                },
                {
                    text: ">",
                    callback_data: `musicshare://action?action=down&pid=${desPage}&q=${params.q}&id=${params.id}`
                }
            ])
        }
        return keys
    }
}

exports.meta = config.components.musicshare

exports.commands = {
    netease: async function (context) {
        let args = context.args
        let type = args[0]

        if (/(song)|(playlist)|(album)/i.test(type) && args.length >= 2) {
            let keyword = new Array()
            args.forEach(arg => keyword.push(arg))
            keyword = keyword.join(" ")

            switch (type) {
                case "song":

                    break
                case "playlist":

                    break
                case "album":

                    break
            }

            return result
        }

        return undefined
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
                Compo.Interface.Log.Log.info(`${context.ctx.from.first_name} 请求歌单数据来自链接: ${link}`)

                let params = main.parseArgs(link)
                let result = await main.playlist(params)
                if (result == undefined) {
                    return undefined
                }
                else {
                    let keys = new Array()
                    let length = result.tracks.length > 6 ? 6 : result.tracks.length
                    for (let i = 0; i < length; i++) {
                        let key = [{
                            text: `${result.tracks[i].name} - ${result.tracks[i].artist}`,
                            callback_data: "musicshare://song?id=" + result.tracks[i].id
                        }]
                        keys.push(key)
                    }
                    if (result.tracks.length < 7) {
                        keys.push([
                            {
                                text: 1,
                                callback_data: "musicshare://null?pid=1&q=p&id=" + params.id
                            }
                        ])
                    }
                    else {
                        keys.push([
                            {
                                text: 1,
                                callback_data: "musicshare://null?pid=1&id=" + params.id
                            },
                            {
                                text: ">",
                                callback_data: "musicshare://action?action=down&pid=1&q=p&id=" + params.id
                            }
                        ])
                    }
                    this.telegram.sendMessage(context.ctx.message.chat.id, result.text, {
                        reply_markup: {
                            inline_keyboard: keys
                        },
                        parse_mode: "Markdown"
                    })
                }
            }
        }
        else {
            return "/playlist 歌单链接 或者 整个分享文本\n如果想要搜索关键词可以使用 /netease playlist 关键词"
        }
    },
    album: async function (context) {
        let urlCheck = /((https?)?((:\/\/))?)(music.163.com)(\/)(#\/)?(m\/)?(album)((\/\d+)|(\?id=\d+))((&userid=\d+)|(\/\?userid=\d+)|(\/\d+\/(\?userid=\d+)?)|(\/\d+\/)|(\/))?/gui
        let message = context.ctx.message.text
        let link = new Array()

        if (context.args[0]) {
            context.args.forEach(item => {
                link.push(item.match(urlCheck))
            })
            link = link.join("")
            if (link == "") {
                return "使用方法有误哦！\n/album 专辑链接 或者 整个分享文本\n如果想要搜索关键词可以使用 /netease album 关键词"
            }
            else {
                Compo.Interface.Log.Log.info(`${context.ctx.from.first_name} 请求专辑数据来自链接: ${link}`)

                let params = main.parseArgs(link)
                let result = await main.album(params)
                if (result == undefined) {
                    return undefined
                }
                else {
                    let keys = new Array()
                    let length = result.tracks.length > 6 ? 6 : result.tracks.length
                    for (let i = 0; i < length; i++) {
                        let key = [{
                            text: `${result.tracks[i].name} - ${result.tracks[i].artist}`,
                            callback_data: "musicshare://song?id=" + result.tracks[i].id
                        }]
                        keys.push(key)
                    }
                    if (result.tracks.length < 7) {
                        keys.push([
                            {
                                text: 1,
                                callback_data: "musicshare://null?pid=1&q=a&id=" + params.id
                            }
                        ])
                    }
                    else {
                        keys.push([
                            {
                                text: 1,
                                callback_data: "musicshare://null?pid=1&id=" + params.id
                            },
                            {
                                text: ">",
                                callback_data: "musicshare://action?action=down&pid=1&q=a&id=" + params.id
                            }
                        ])
                    }
                    this.telegram.sendMessage(context.ctx.message.chat.id, result.text, {
                        reply_markup: {
                            inline_keyboard: keys
                        },
                        parse_mode: "Markdown"
                    })
                }
            }
        }
        else {
            return "/album 歌单链接 或者 整个分享文本\n如果想要搜索关键词可以使用 /netease album 关键词"
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
                if (data instanceof Error) {
                    this.DiagnosticLog.fatal(data)
                    return undefined
                }
                else if (data.inline[0].audio_url == null) {
                    return [{
                        type: "article",
                        id: params.id,
                        title: `${data.inline[0].title}`,
                        description: "我们找到了曲目，但是对不起呢，歌曲暂不可用",
                        thumb_url: "https://i.loli.net/2019/11/13/dQDxC4Nv91VYK2E.jpg",
                        input_message_content: { message_text: `${data.inline[0].title}\n${data.inline[0].performer}\n实在是很抱歉呢，这个歌曲暂不可用，但是可以试试在 App 中打开\n#yawarakai #${params.id}` },
                        reply_markup: {
                            inline_keyboard: [[{
                                text: "Open in App",
                                url: `https://m.music.163.com/m/applink/?scheme=orpheus://song/${params.id}`
                            }]]
                        }
                    }]
                }
                else {
                    return data.inline
                }

            }
            else if (params.type == "album") {
                Compo.Interface.Log.Log.info(`${ctx.from.first_name} 请求查询专辑来自链接: ${link}`)
                let data = await main.album(params)
                return undefined
            }
            else if (params.type == "playlist") {
                Compo.Interface.Log.Log.info(`${ctx.from.first_name} 请求查询歌单来自链接: ${link}`)
                let data = await main.playlist(params)
                return undefined
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
        const Telegram = this.telegram

        if (!ctx.update.callback_query.data.startsWith("musicshare")) { return undefined }

        let callbackData = ctx.update.callback_query
        let params = main.parseArgs(callbackData.data)

        if (params == undefined) { return undefined }

        /**
         * Song
         */
        if (params.type == "song") {

            let message = await this.telegram.sendMessage(
                callbackData.message.chat.id,
                "稍等呢，正在获取数据"
            ).catch(err => {
                throw err
            })

            let data = await main.song(params, 320000, "callback").catch(err => {
                throw err
            })

            try {

                message = await Telegram.editMessageText(
                    message.chat.id,
                    message.message_id,
                    null,
                    "数据获取成功，正在更新到消息~"
                ).catch(err => {
                    throw err
                })

                if (data == undefined) { throw new Error() }
                console.log(data)
                
                let audioMessage = await Telegram.sendAudio(callbackData.message.chat.id, { source: fs.createReadStream(data.file.audio) }, {
                    performer: data.callback.performer,
                    thumb: data.callback.thumb,
                    title: data.callback.title,
                    caption: data.callback.caption,
                    parse_mode: data.callback.parse_mode,
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: "Open in App",
                                url: `https://m.music.163.com/m/applink/?scheme=orpheus://song/${params.id}`
                            }]
                        ]
                    }
                }).then(res => {
                    Telegram.deleteMessage(message.chat.id, message.message_id)
                    return "Passed"
                }).catch(err => {
                    throw err
                })
                //Telegram.deleteMessage(message.chat.id, message.message_id)
            }
            catch (err) {
                Telegram.editMessageText(
                    message.chat.id,
                    message.message_id,
                    null,
                    "歌曲找到了，但是暂时不可用呢~\n可以稍后试试看\n如果一直出现这个问题的话，可以去 Bot 汇报错误情况呢，并且给出出错的的歌曲链接"
                ).catch(err => {
                    throw err
                })
                throw err
            }

        }

        /**
         * Action
         */
        if (params.type == "action") {
            let message = await Telegram.editMessageText(
                callbackData.message.chat.id,
                callbackData.message.message_id,
                null,
                callbackData.message.text + `\n正在更新歌单信息，请稍等哦。`,
                {
                    parse_mode: "Markdown"
                }
            )
            if (params.action == "up") {
                Compo.Interface.Log.Log.info(`${ctx.from.first_name} 请求歌单数据来自 ID: ${params.id}`)
                let previous
                if (params.q == "p") { previous = await main.playlist(params) }
                else if (params.q == "a") { previous = await main.album(params) }
                if (previous == undefined) {
                    return undefined
                }
                else {

                    let keys = main.pageUp(6, previous.tracks, params, "playlist")

                    message = await this.telegram.editMessageText(
                        message.chat.id,
                        message.message_id,
                        null,
                        previous.text, {
                        reply_markup: {
                            inline_keyboard: keys
                        },
                        parse_mode: "Markdown"
                    })
                }
            }
            else if (params.action == "down") {
                Compo.Interface.Log.Log.info(`${ctx.from.first_name} 请求歌单数据来自 ID: ${params.id}`)
                let next
                if (params.q == "p") { next = await main.playlist(params) }
                else if (params.q == "a") { next = await main.album(params) }
                if (next == undefined) {
                    return undefined
                }
                else {

                    let keys = main.pageDown(6, next.tracks, params, "playlist")

                    message = await this.telegram.editMessageText(
                        message.chat.id,
                        message.message_id,
                        null,
                        next.text, {
                        reply_markup: {
                            inline_keyboard: keys
                        },
                        parse_mode: "Markdown"
                    })
                }
            }
        }
        return "Got"
    }
}

exports.register = {
    // As the example to Yawarakai Compos
    commands: [
        {
            function: 'netease',
            help: "Unavailable (Under Construction)"
        },
        {
            function: 'playlist',
            help: "歌单链接 或者 整个分享文本\n如果想要搜索关键词可以使用 /netease playlist 关键词"
        },
        {
            function: 'album',
            help: "专辑链接 或者 整个分享文本\n如果想要搜索关键词可以使用 /netease album 关键词"
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
