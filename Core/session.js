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
        return new Promise((resolve, reject) => {
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

    allowEula(id, set = "yawarakai") {
        return new Promise((resolve, reject) => {
            Store.session.find({ key: "user", userId: id, set: set, property: "tosagreement" }, (err, doc) => {
                if (err) reject(err)
                if (doc.length === 0) resolve(false)
                else {
                    if (e.key === true) resolve(true)
                    else resolve(false)
                }
            })
        })
    },

    allowDataAnalyze(id, set = "yawarakai") {
        return new Promise((resolve, reject) => {
            Store.session.find({ key: "user", userId: id, set: set, property: "ppagreement" }, (err, doc) => {
                if (err) reject(err)
                if (doc.length === 0) resolve(false)
                else {
                    if (e.key === true) resolve(true)
                    else resolve(false)
                }
            })
        })
    },

    append(id, key, value = "", set = "yawarakai") {
        return new Promise((resolve, reject) => {
            Store.session.find({ key: "user", userId: id, set: set }, (err, doc) => {
                if (err) reject(false)
                if (doc.length === 0) resolve(false)

                Store.session.insert({ key: "user", userId: id, set: set, roperty: key, value: value })
            })
        })
    },

    update(id, key, value, set = "yawarakai") {
        return new Promise((resolve, reject) => {
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

let Component = {
    User: {
        isFirst(id, set) {
            return new Promise((resolve, reject) => {
                if (set === "yawarakai") reject(new Error("Permission Rejected: Cannot edit yawarakai database"))
                Store.session.find({ key: "user", userId: id, set: set }, (err, doc) => {
                    if (err) reject(err)
                    if (doc.length === 0) resolve(true)
                    else resolve(false)
                })
            })
        },
        exist(id, key, set) {
            return new Promise((resolve, reject) => {
                if (set === "yawarakai") reject(new Error("Permission Rejected: Cannot edit yawarakai database"))
                User.exist(id, key, set).then(res => {
                    resolve(res)
                }).catch(err => {
                    reject(err)
                })
            })
        },
        query(id, key, set) {
            return new Promise((resolve, reject) => {
                if (set === "yawarakai") reject(new Error("Permission Rejected: Cannot edit yawarakai database"))
                Store.session.find({ key: "user", userId: id, set: set }, (err, doc) => {
                    if (err) reject(false)
                    if (doc.length === 0) resolve(false)
                    doc.forEach(e => {
                        if (e.property === key) resolve({ property: e.property, value: e.value, set: e.set })
                        else reject(false)
                    })
                })
            })
        },
        detail(id, set) {
            return new Promise((resolve, reject) => {
                if (set === "yawarakai") reject(new Error("Permission Rejected: Cannot edit yawarakai database"))
                Store.session.find({ key: "user", userId: id, set: set }, (err, doc) => {
                    if (err) reject(false)
                    if (doc) resolve(doc)
                })
            })
        },
        allowEula(id, set) {
            if (set === "yawarakai") reject(new Error("Permission Rejected: Cannot edit yawarakai database"))
            User.allowEula(id, set).then(res => {
                resolve(res)
            }).catch(err => {
                reject(err)
            })
        },
        allowDataAnalyze(id, set) {
            if (set === "yawarakai") reject(new Error("Permission Rejected: Cannot edit yawarakai database"))
            User.allowDataAnalyze(id, set).then(res => {
                resolve(res)
            }).catch(err => {
                reject(err)
            })
        },
        append(id, key, value, set) {
            return new Promise((resolve, reject) => {
                if (set === "yawarakai") reject(new Error("Permission Rejected: Cannot edit yawarakai database"))
                User.append(id, key, value, set).then(res => {
                    resolve(res)
                }).catch(err => {
                    reject(err)
                })
            })
        },
        update(id, key, value, set) {
            return new Promise((resolve, reject) => {
                if (set === "yawarakai") reject(new Error("Permission Rejected: Cannot edit yawarakai database"))
                User.update(id, key, value, set).then(res => {
                    resolve(res)
                }).catch(err => {
                    reject(err)
                })
            })
        }
    }
}

module.exports = {
    User,
    Group,
    UserSession,
    GroupSession,
    Component
}