let baseThumb = "https://i.loli.net/2019/10/03/SXtUdTxMOq5bQWG.jpg"

var queue = []

function article(inlineQueryId, inlineTitle, inlineDecp, inlineThumb = baseThumb, inlineMessage) {
    let basicArticleTemplate = {
        type: "article",
        id: inlineQueryId,
        title: inlineTitle,
        description: inlineDecp,
        thumb_url: inlineThumb,
        input_message_content: { message_text: inlineMessage }
    }
    return basicArticleTemplate
}

function finished(ctx) {
    ctx.answerInlineQuery(queue, { cache_time: 0 }).then(() => {
        console.log("Posted")
        queue = []
    }).catch(err => {
        console.log(err)
    })
}

exports.article = article
exports.finished = finished