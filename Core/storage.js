// Dependencies

let fs = require('fs')
let path = require('path')
let Datastore = require('nedb')

// Local Files

let Log = require('../Core/log').Log
let config = require('../config.json')

// Storage

let mainDbPath = path.resolve(config.database.base)
let sessionDbPath = path.resolve(config.database.session)

let dataDir = path.parse(mainDbPath).dir
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir)
}

let mainDb
let sessionDb
// let sessionDb = new Datastore()
let db = new Datastore()

if (config.debugmode) {
    mainDb = new Datastore()
    sessionDb = new Datastore()
}
else {
    mainDb = new Datastore({ filename: mainDbPath, autoload: true })
    sessionDb = new Datastore({ filename: sessionDbPath, autoload: true })
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
            if (docs.length === 0) reject(new Error("Cannot find query " + JSON.stringify(key)))
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

let remove = async (query, option) => {
    return db.remove(query, option, (err, docs) => {
        if (err) throw err
        return docs
    })
}

let Data = {
    async createUserDatabase(set, userid) {
        let path = "data/user/" + set + "/" + "u" + userid
        let userDataPath = path.resolve(path)
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir)
        }

        let database = new Datastore({ filename: userDataPath, autoload: true })
        return path
    }
}

let adminsDatabaseMissingError = new Error("Admin database encountered an error, check your files permissions and integrity")
adminsDatabaseMissingError.name = "AdminDatabaseFatalError"

let getAdmins = () => {
    return new Promise((resolve, reject) => {
        mainDb.find({ key: admin }, (err, docs) => {
            if (err) Log.fatal(err)
            if (docs.length === 0) {
                reject(adminsDatabaseMissingError)
            }
            else {
                resolve(docs.pop().users)
            }
        })
    })
}

let isAdmin = (id) => {
    id = id + ""
    return new Promise((resolve, reject) => {
        mainDb.find({ key: "admins" }, (err, docs) => {
            if (err) Log.fatal(err)
            if (docs.length === 0) {
                reject(adminsDatabaseMissingError)
            }
            else {
                let users = docs.pop().users
                try {
                    if (users.includes(id)) {
                        resolve(true)
                    }
                    else {
                        resolve(false)
                    }
                }
                catch (err) {
                    Log.fatal(err)
                }
            }
        })
    })
}

exports.update = update
exports.remove = remove
exports.insert = insert
exports.find = find
exports.getAdmins = getAdmins
exports.isAdmin = isAdmin

exports.yawarakai = mainDb
exports.session = sessionDb