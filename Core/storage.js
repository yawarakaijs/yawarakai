// Dependencies

let fs = require('fs')
let path = require('path')
let Datastore = require('nedb')

// Local Files

let config = require('../config.json')

// Storage

let dbPath = path.resolve(config.database.path)
let db

let init = () => {

    let dataDir = path.parse(dbPath).dir
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir)
    }

    db = new Datastore({ filename: dbPath, autoload: true })
}

let insert = (data) => {
    return new Promise((resolve, reject) => {
        return db.insert(data, (err, doc) => {
            if (err) {
                reject(err)
                return err
            }
            else {
                resolve(doc)
                return doc
            }
        })
    })
}

let find = (key) => {
    return new Promise((resolve, reject) => {
        db.find(key, (err, docs) => {
            if (err) reject(err)
            if (docs.length == 0) reject(new Error("Cannot find query: " + JSON.stringify(key))) 
            resolve(docs)
        })
    })
}

let update = async (query, update, option) => {
    return db.update(query, update, option, (err, docs) => {
        if (err) throw err
        return docs
    })
}

exports.init = init
exports.update = update
exports.insert = insert
exports.find = find