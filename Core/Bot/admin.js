// Local Files

let Log = require('../log').Log
let Store = require('../storage')
let config = require('../../config.json')

let Control = {
    cli(args) {
        args = args.slice(2)
        switch (args[0]) {
            case "--set":
                Store.yawarakai.find({ key: "admins" }, (err, docs) => {
                    if (err) Log.fatal(err)
                    if (docs.length === 0) {
                        Store.yawarakai.insert({ key: "admins", users: [args[1]] })
                    }
                    else {
                        Store.yawarakai.update({ key: "admins" }, { $addToSet: { users: args[1] } }, {}, (err, docs) => {
                            if (err) {
                                Log.fatal("Database encountered error, check your file permissions and integrity")
                                return undefined
                            }
                            Log.info(`Successfully set user ${args[1]} as admin`)
                            Store.yawarakai.find({ key: "admins" }, (err, docs) => {
                                if (docs.length !== 0) Log.info(`Now admins: ${docs.pop().users}`)
                            })
                        })
                    }
                })
                break
            case "--unset":
                Store.yawarakai.find({ key: "admins" }, (err, docs) => {
                    if (err) Log.fatal(err)
                    if (docs.length === 0) {
                        return undefined
                    }
                    else {
                        Store.yawarakai.update({ key: "admins" }, { $pull: { users: args[1] } }, {}, (err, docs) => {
                            if (err) Log.fatal(err)
                            Log.info(`Successfully unset user ${args[1]} from admin list`)
                            Store.yawarakai.find({ key: "admins" }, (err, docs) => {
                                if (docs.length !== 0) Log.info(`Now admins: ${docs.pop().users}`)
                            })
                        })
                    }
                })
                break
            case "--list-users":
                // todo
                break
        }
    },

    start(context) {
        let id = context.ctx.from.id
        let ctx = context.ctx


    }
}

exports.cli = Control.cli
exports.start = Control.start
exports.Control = Control