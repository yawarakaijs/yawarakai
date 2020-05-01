// Dependencies

let spawn = require('child_process').spawn
let spawnSync = require('child_process').spawnSync

// Local

let Log = require('../log').Log

let PackageManagerTest = [
    {
        exec: 'yarn',
        testArgs: ['-v'],
        add(package) {
            return ['add', package]
        },
        remove(package) {
            return ['remove', package]
        }
    },
    {
        exec: 'npm',
        testArgs: ['-v'],
        add(package) {
            return ['install', package, '--save']
        },
        remove(package) {
            return ['uninstall', package]
        },
    }
]

let PackageManager = {
    async find(possibilities) {
        for (let i = 0; i < possibilities.length; i++) {
            let pmTest = possibilities[i]
            let pm = spawnSync(pmTest.exec, pmTest.testArgs)
            if (pm.status === 0) {
                Log.info(`Found package manager: ${pmTest.exec}`)
                return pmTest
            }
        }
    }
}

let Composer = {
    async add(package) {
        return await new Promise(async (resolve, reject) => {
            let pm = await PackageManager.find(PackageManagerTest)
            Log.info(`Installing package ${package} with ${pm.exec}`)

            let pkgManager = spawn(pm.exec, pm.add(package))
            pkgManager.on('close', code => {
                if (code === 0) {
                    Log.info(`Package ${package} successfully installed`)
                    resolve(code)
                } else {
                    Log.info(`Failed to install package ${package}, error code ${code}`)
                    reject(code)
                }
            })
            pkgManager.on('error', (err) => {
                Log.info(`Failed to install package ${package}, error occurred ${err}`)
                reject(err)
            })
        })
    },
    async remove(package) {
        return await new Promise(async (resolve, reject) => {
            let pm = await PackageManager.find(PackageManagerTest)
            Log.info(`Removing package ${package} with ${pm.exec}`)

            let pkgManager = spawn(pm.exec, pm.remove(package))
            pkgManager.on('close', code => {
                if (code === 0) {
                    Log.info(`Package ${package} successfully removed`)
                    resolve(code)
                } else {
                    Log.info(`Failed to remove package ${package}, error code ${code}`)
                    reject(code)
                }
            })
            pkgManager.on('error', (err) => {
                Log.info(`Failed to remove package ${package}, error occurred ${err}`)
                reject(err)
            })
        })
    }
}

exports.Composer = Composer
