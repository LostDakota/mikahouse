'use strict'

const MCTX = require('../components/MikaHouseContext')
const CONFIG = require('../.config')

let ping = require('ping')
let os = require('os-utils')
let diskspace = require('diskspace')
let request = require('request')

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

var driveSpace = (driveLetter) => {
    return new Promise((resolve, reject) => {
        diskspace.check('/mnt/' + driveLetter, (err, result) => {
            if(err) reject(err)
            resolve({
                letter: driveLetter.toUpperCase(),
                used: Math.floor((result.used / result.total) * 100),
                free: Math.floor((result.free / result.total) * 100)
            })
        })
    })
}

module.exports = {
    ListNetwork: () => {
        return new Promise((resolve, reject) => {
            MCTX.query('select ip, name, recorded from network', (err, rows, fields) => {
                if(err) reject(err)
                resolve(rows)
            })
        })
    },
    PollNetwork: () => {
        return new Promise((resolve, reject) => {
            request.get('http://' + CONFIG.ZoneMinder.Host + ':88', (err, response, body) => {
                if(err) reject(err)
                var devices = JSON.parse(body)
                devices.forEach(device => {
                    MCTX.query('insert into network (ip, mac) values ("' + device.ip + '", "' + device.mac + '") on duplicate key update recorded=values(recorded)', (err, rows, fields) => {
                        if(err) reject(err)
                    })
                })
                resolve(devices)
            })
        })
    },
    GetStats: () => {
        return new Promise((resolve, reject) => {
            MCTX.query('select * from server_stats', (err, rows, fields) => {
                if(err) reject(err)
                resolve(rows)
            })
        })
    },
    Ping: (construct) => {
        return new Promise((resolve, reject) => {
            ping.promise.probe('google.com')
                .then((res) => {
                    if(construct) resolve({
                        Name: 'Ping',
                        Icon : "fa-wifi",
                        Value : res.avg
                    })
                    resolve({name: 'Ping', value: res.avg + 'ms'})
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
                resolve({name: 'Load', value: Math.floor(value * 100) + '%'})
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
            resolve({name: 'Uptime', value: format(process.uptime())})
        })
    },
    DiskUsage: () => {
        return new Promise((resolve, reject) => {
            var drives = ['c', 'd', 'e']
            var promises = []
            drives.forEach(letter => {
                promises.push(driveSpace(letter))
            })
            Promise.all(promises)
                .then(results => {
                    resolve(results)
                })
        })
    },
    RecordStats: () => {
        return new Promise((resolve, reject) => {
            var promises = [
                module.exports.Ping(false),                
                module.exports.Load(false),
                module.exports.Uptime(false)
            ]
            Promise.all(promises)
                .then(results => {
                    results.forEach(stat => {
                        MCTX.query('update server_stats set statistic="' + stat.value + '" where name="' + stat.name + '"', (err, rows, fields) => {
                            if(err) reject(err)
                        })
                    })
                    resolve('ok')
                })
        })
    }
}