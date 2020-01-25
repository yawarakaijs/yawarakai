// Dependencies



// Local Package

let Store = require('./storage')

// Session

class UserSession {
    constructor(id, key = "", value = "", set = "yawarakai") {
        this.id = id
        this.property = key
        this.set = set

        Store.session.find({ key: "user", userId: id, set: set }, (err, doc) => {
            if (err || doc.length === 0) {
                Store.session.insert({ key: "user", userId: id, set: set, property: key, value: value })
            }
        })

        Store.session.update({ key: "activeUser" }, { $addToSet: { users: id } }, {})
    }

    update() {

    }
}

class GroupSession {
    constructor() {

    }

    isFirst() {

    }

    update() {

    }

    query() {

    }

    users() {

    }

    detail() {

    }
}

let User = {
    isFirst(id) {
        return new Promise((resolve, reject) => {
            Store.session.find({ key: "user", userId: id }, (err, docs) => {
                let result

                if (err) result = true
                if (docs.length === 0) result = true
                else result = false
                resolve(result)
            })
        })
    },

    query(id, key) {
        return new Promise((resolve, reject) => {
            Store.session.find({ key: "user", userId: id }, (err, doc) => {
                if (err) reject(false)
                if (doc.length === 0) resolve(false)
                doc.forEach(e => {
                    if (e.property === key) resolve({ property: e.property, value: e.value, set: e.set })
                    else reject(false)
                })
            })
        })
    },

    exist(id, key, set = "yawarakai") {
        console.log("Checking...")
        return new Promise((resolve, reject) => {
            console.log("Checking: " + key, " in " + set)
            Store.session.find({ key: "user", userId: id, set: set, property: key }, (err, doc) => {
                let result

                if (err) reject(err)
                if (doc.length === 0) result = false
                else result = true
                resolve(result)
            })
        })
    },

    detail(id) {
        return new Promise((resolve, reject) => {
            Store.session.find({ key: "user", userId: id }, (err, doc) => {
                if (err) reject(false)
                if (doc) resolve(doc)
            })
        })
    },

    allowEula() {

    },

    allowDataAnalyze() {

    },

    append(id, key, value = "", set = "yawarakai") {
        return new Promise((resolve, reject) => {
            console.log("Appending: " + key, "in " + set + " to " + value)
            Store.session.find({ key: "user", userId: id, set: set }, (err, doc) => {
                if (err) reject(false)
                if (doc.length === 0) resolve(false)

                Store.session.insert({ key: "user", userId: id, set: set, roperty: key, value: value })
            })
        })
    },

    update(id, key, value, set = "yawarakai") {
        return new Promise((resolve, reject) => {
            console.log("Updating: " + key, "in " + set + " to " + value)
            Store.session.find({ key: "user", userId: id, set: set, property: key }, (err, doc) => {
                if (err) reject(false)
                if (doc.length === 0) resolve(false)

                let res = doc.pop()
                if (res.property === key) {
                    Store.session.update({ key: "user", userId: id, set: set, property: key }, { $set: { value: value } }, {})
                    resolve(true)
                }
                else {
                    resolve(false)
                }
            })
        })
    }
}

let Group = {

}

module.exports = {
    User,
    Group,
    UserSession,
    GroupSession
}