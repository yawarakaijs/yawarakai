// Dependecies

let axios = require('axios')
let cheerio = require('cheerio')
let Compo = require('../../component')

// Component Method

let config = require('./config.json')

// main

let main = {
    getData: async function (ctx, info, flight) {
        Compo.Interface.Log.Log.info(ctx.from.first_name + " 申请查询航班信息: " + info[0] + " " + info[1])

        // Link Prefix

        let linkPrefix

        switch(config.components.flight.locale) {
        case "zh-CN":
            linkPrefix = "https://www.cn.kayak.com/tracker/"
            break
        case "zh-HK":
            linkPrefix = "https://www.kayak.com.hk/tracker/"
            break
        case "en-US":
            linkPrefix = "https://www.kayak.com/tracker/"
            break
        default:
            linkPrefix = "https://www.kayak.com/tracker/"
            break
        }

        let link = linkPrefix + info[0] + "/" + info[1]
        return axios.get(link).then(htmlString => {
            var $ = cheerio.load(htmlString.data)
            var flightStatus = $('div.statusLines').text().split('\n')
            if(flightStatus[1] == undefined) {
                Compo.Interface.Log.Log.warning(`无该航班信息 ${info[0]}。`)
                return undefined
            }

            let flight = {
                depart : flightStatus[1],
                departAirport : flightStatus[2],
                departSchechuleDate : flightStatus[3],
                departSchechuleDateInfo : flightStatus[4],
                departSchechuleTime : flightStatus[5],
                departSchechuleTimeInfo : flightStatus[6],
                departActualTime : flightStatus[7],
                departActualTimeInfo : flightStatus[8],
                departTerminal : flightStatus[9],
                departTerminalInfo : flightStatus[10],
                departGate : flightStatus[11],
                departGateInfo : flightStatus[12],

                arrival : flightStatus[14],
                arrivalAirport : flightStatus[15],
                arrivalSchechuleDate : flightStatus[16],
                arrivalSchechuleDateInfo : flightStatus[17],
                arrivalSchechuleTime : flightStatus[18],
                arrivalSchechuleTimeInfo : flightStatus[19],
                arrivalActualTime : flightStatus[20],
                arrivalActualTimeInfo : flightStatus[21],
                arrivalTerminal : flightStatus[22],
                arrivalTerminalInfo : flightStatus[23],
                arrivalGate : flightStatus[24],
                arrivalGateInfo : flightStatus[25],
            }

            let data = new Array()
            
            data.push(`${flight.departAirport} -> ${flight.arrivalAirport}`)
            data.push("")
            data.push(`*${flight.depart}*`)
            data.push(`${flight.departSchechuleDate}: *${flight.departSchechuleDateInfo}*`)
            data.push(`${flight.departSchechuleTime}: *${flight.departSchechuleTimeInfo}*`)
            data.push(`${flight.departActualTime}: ${flight.departActualTimeInfo}`)
            data.push(`${flight.departTerminal}: ${flight.departTerminalInfo} ${flight.departGate}: *${flight.departGateInfo}*`)
            data.push("")
            data.push(`*${flight.arrival}*`)
            data.push(`${flight.arrivalSchechuleDate}: *${flight.arrivalSchechuleDateInfo}*`)
            data.push(`${flight.arrivalSchechuleTime}: *${flight.arrivalSchechuleTimeInfo}*`)
            data.push(`${flight.arrivalActualTime}: ${flight.arrivalActualTimeInfo}`)
            data.push(`${flight.arrivalTerminal}: ${flight.arrivalTerminalInfo} ${flight.arrivalGate}: *${flight.arrivalGateInfo}*`)

            data =  { data: data.join("\n"), flight: flight }
            return data

        }).catch(function (err) {
            Compo.Interface.Log.Log.fatal(`用户 ${ctx.message.from.id} 查询的航班信息获取失败。`)
        })
    }
}

// Change the Component Name according to the config.json

exports.meta = config.components.flight

// Inner

exports.commands = {
    flight: async function (context) {
        let ctx = context.ctx
        let data = context.args.join(" ")

        let flightNumPattern = /(([a-zA-Z])|(\d)){2}((-)|( ))?(\d{3,4})/gi
        let flightNumInputPattern = /(([a-zA-Z])|(\d)){2}(-)(\d{3,4})/gi
        let flightNum = new String("")
        let flightData = flightNumPattern[Symbol.match](data)
        if(!flightData || flightData == null) {
            ctx.reply("不知道你的航班号是什么了啦~ \n使用方法： /flight AR-NUMB YYYY-MM-DD \nAR 是航空公司短标识，NUMB 是航线标识，日期格式应为：1970-01-01")
            return undefined
        }

        let Time = new Date()
        let CurrentTime = Time.getFullYear() + "-" + ("0"+(Time.getMonth()+1)).slice(-2) + "-" + ("0" + Time.getDate()).slice(-2)
        let CurrentTimeInfo = Time.getFullYear() + ("0"+(Time.getMonth()+1)).slice(-2) + ("0" + Time.getDate()).slice(-2)

        let date = new String("")
        let datePattern = /(\d{4})-(\d{2})-(\d{2})/g
        date = datePattern[Symbol.match](data)
        
        let dateInfo
        
        if(!date || date == null) {
            date = CurrentTime
        }
        else {
            dateInfo = date[0].replace("-", "")
            let dateRange = CurrentTimeInfo + 6
            if(dateInfo > dateRange) {
                ctx.reply("不能查询那个日期的航班喔，只能查询最近 7 天的航班呢w \n很抱歉啦，也有正在尽力寻找其他解决办法呢w")
                return undefined
            }
        }

        let flight
        flightNum += flightData

        if(!flightNumInputPattern.test(flightNum)) {

            let flightNumInputPattern1 = /(([a-zA-Z])|(\d)){2}( )(\d{3,4})/gi
            let flightNumInputPattern2 = /(([a-zA-Z])|(\d)){2}(\d{3,4})/gi

            if(flightNumInputPattern1.test(flightNum)) {
                let array = flightNum.split(' ')
                flight = array[0] + "-" + array[1]
            }
            if(flightNumInputPattern2.test(flightNum)) {
                flight = flightNum.slice(0, 2) + "-" + flightNum.replace(flightNum.slice(0, 2), '')
            }
        }
        else {
            flight = flightNum
        }

        let info = [flight, date]
        ctx.reply("正在申请查询航班信息: " + info[0])
        let result = await main.getData(ctx, info, data).catch(err => {
            ctx.reply("抱歉，航班查询服务目前暂不可用。")
        })
        if(result == undefined) {
            ctx.reply("找不到这个航班呢喵 qwq\n可能是搜索的日期没有该航班呢")
            return undefined
        }
        ctx.reply(result.data, { parse_mode: "Markdown" })
        Compo.Interface.Log.Log.info("")
        return undefined
    }
}

exports.inlines = {
    main: async function (ctx) {
        let data = ctx.inlineQuery.query

        let flightNumPattern = /(([a-zA-Z])|(\d)){2}((-)|( ))?(\d{3,4})/gi
        let flightNumInputPattern = /(([a-zA-Z])|(\d)){2}(-)(\d{3,4})/gi
        let flightNum = new String("")
        let flightData = flightNumPattern[Symbol.match](data)
        if(!flightData || flightData == null) {
            return undefined
        }

        let Time = new Date()
        let CurrentTime = Time.getFullYear() + "-" + ("0"+(Time.getMonth()+1)).slice(-2) + "-" + ("0" + Time.getDate()).slice(-2)
        let CurrentTimeInfo = Time.getFullYear() + ("0"+(Time.getMonth()+1)).slice(-2) + ("0" + Time.getDate()).slice(-2)

        let date = new String("")
        let datePattern = /(\d{4})-(\d{2})-(\d{2})/g
        date = datePattern[Symbol.match](data)
        
        let dateInfo
        
        if(!date || date == null) {
            date = CurrentTime
        }
        else {
            dateInfo = date[0].replace("-", "")
            let dateRange = CurrentTimeInfo + 6
            if(dateInfo > dateRange) {
                return [{
                    type: "article",
                    id: ctx.inlineQuery.id,
                    title: "查询失败",
                    description: "不能查询那个日期的航班喔，只能查询最近 7 天的航班呢w \n很抱歉啦，也有正在尽力寻找其他解决办法呢w",
                    thumb: "https://i.loli.net/2019/11/19/2IySvl8FZhUxd9c.png",
                    input_message_content: { message_text: "航班查询失败" }
                }]
            }
        }

        let flight
        flightNum += flightData

        if(!flightNumInputPattern.test(flightNum)) {

            let flightNumInputPattern1 = /(([a-zA-Z])|(\d)){2}( )(\d{3,4})/gi
            let flightNumInputPattern2 = /(([a-zA-Z])|(\d)){2}(\d{3,4})/gi

            if(flightNumInputPattern1.test(flightNum)) {
                let array = flightNum.split(' ')
                flight = array[0] + "-" + array[1]
            }
            if(flightNumInputPattern2.test(flightNum)) {
                flight = flightNum.slice(0, 2) + "-" + flightNum.replace(flightNum.slice(0, 2), '')
            }
        }
        else {
            flight = flightNum
        }

        let info = [flight, date]
        let result = await main.getData(ctx, info, data)
        data = [{
            type: "article",
            id: ctx.inlineQuery.id,
            title: info[1] + " " + info[0],
            description: result.flight.departSchechuleTimeInfo + " -> " + result.flight.arrivalActualTimeInfo,
            thumb: "https://i.loli.net/2019/11/13/dQDxC4Nv91VYK2E.jpg",
            input_message_content: { message_text: result.data, parse_mode: "Markdown" }
        }]

        return data
    }
}

// Register

exports.register = {
    // As the example to Yawarakai Compos
    commands: [
        {
            function: 'flight'
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
        // {
        //     function: 'main'
        // }
    ]
}