'use strict'

let ping = require('ping')
let os = require('os-utils')
let diskspace = require('diskspace')

var format = (seconds) => {
    var sec = parseInt(seconds, 10)
    var hours = Math.floor(sec / 3600)
    var minutes = Math.floor((sec - (hours * 3600)) / 60)
    var seconds = sec - (hours * 3600) - (minutes * 60)

    var str = []

    if(hours > 0){
        str.push(hours + "h")
    }
    if(minutes > 0){
        str.push(minutes + "m")
    }
    if(seconds > 0){
        str.push(seconds + "s")
    }

    return str.toString()
}

var driveSpace = (drivePath) => {
    return new Promise((resolve, reject) => {
        diskspace.check((err, result) => {
            if(err) reject('error')
            resolve(result.used)
        })
    })
}

var disks = (driveLetter) => {
    diskspace.check(driveLetter, (err, result) => {
        return result.used
    })
}

module.exports = {
    Ping: (construct) => {
        return new Promise((resolve, reject) => {
            ping.promise.probe('google.com')
                .then((res) => {
                    if(construct) resolve({
                        Name: 'Ping',
                        Icon : "fa-wifi",
                        Value : res.avg
                    })
                    resolve(res.avg)
                })
        })
    },
    Load: (construct) => {
        return new Promise((resolve, reject) => {
            os.cpuUsage((value) => {
                if(construct) resolve({
                    Name: 'Load',
                    Icon: 'fa-balance-scale',
                    Value : Math.floor(value * 100) + '%'
                })
                resolve(Math.floor(value * 100))
            })
        })
    },
    Uptime: (construct) => {
        return new Promise((resolve, reject) => {
            if(construct) resolve({
                Name: 'Uptime',
                Icon: 'fa-desktop',
                Value : format(process.uptime())
            })
            resolve(format(process.uptime()))
        })
    },
    DiskUsage: () => {
        var diskObj = {}
        return new Promise((resolve, reject) => {
            driveSpace('/mnt/c')
                .then((used) => {
                    resolve(used)
                })
        })
    }
}