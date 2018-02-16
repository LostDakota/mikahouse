'use strict'

const ZM = require('../.config').ZoneMinder
const MCTX = require('../components/MikaHouseContext')
const ZCTX = require('../components/ZoneMinderContext')

let request = require('request')
let fs = require('fs')
let Images = require('../services/Images')

function cameras(){
    return new Promise((resolve, reject) => {
        MCTX.query('select * from cameras where active=1', (err, rows, fields) => {
            if(err) reject('error')
            resolve(rows)
        })
    })    
}

function buildEvent(eventId){
    var event = {}
    var imageSuffix = '-capture.jpg'   
    var videoSuffix = '-r1-s0_5.mp4' 

    return new Promise((resolve, reject) => {
        request.get(ZM.Api + 'events/' + eventId + '.json', (err, response, body) => {
            if(err) reject('error')

            var eventObj = JSON.parse(body).event            
            var alarmFrame = eventObj.Frame.find(element => {
                return element.Type == 'Alarm'
            })

            var imgPath = ZM.Url + eventObj.Event.BasePath + '000' + alarmFrame.FrameId + imageSuffix            
            var videoPath = ZM.Url + eventObj.Event.BasePath + 'Event-' + eventId + videoSuffix

            Promise.all([
                Images.Save(videoPath, '/images/security/events/', eventId + '.mp4'),
                Images.Save(imgPath, '/images/security/events/', eventId + '.jpg')
            ]).then(response => {
                var search = (str, arr) => {
                    for (var i = 0; i < arr.length; i++){
                        if(arr[i].match(str)) return i;
                    }
                    return -1;
                }
                event.poster = response[search('jpg', response)]
                event.video = response[search('mp4', response)]
                resolve(event)
            })
        })
    })
}

module.exports = {
    Status: () => {
        return new Promise((resolve, reject) => {
            request.get(ZM.Api + 'host/daemonCheck.json', (err, response, body) => {
                if(err) reject('error')
                resolve(JSON.parse(body))
            })
        })
    },

    TodaysEvents: () => {
        return new Promise((resolve, reject) => {
            ZCTX.query('select Id from Events where EndTime > curdate() order by EndTime desc', (err, rows, fields) => {
                if(err) reject('error')
                var promises = []
                rows.forEach(element => {
                    promises.push(buildEvent(element.Id))                    
                })
                Promise.all(promises)
                    .then(response => {
                        resolve(response)
                    })
            })
        })
    },

    TodaysEventCount: () => {
        return new Promise((resolve, reject) => {
            ZCTX.query('select count(*) as count from Events where EndTime > curdate()', (err, rows, fields) => {
                if(err) reject('error')
                resolve(rows[0].count)
            })
        })
    },

    LastEvent: () => {
        var imageSuffix = '-capture.jpg'
        return new Promise((resolve, reject) => {
            ZCTX.query('select Id from Events order by id desc limit 1', (err, rows, fields) => {
                if(err) reject('error')
                var id = rows[0].Id
                var event = {}
                request.get(ZM.Api + 'events/' + id + '.json', (err, response, body) => {
                    var eventObj = JSON.parse(body).event
                    event.time = eventObj.Event.EndTime
                    var alarmFrame = eventObj.Frame.find(element => {
                        return element.Type == 'Alarm'
                    })
                    var path = ZM.Url + eventObj.Event.BasePath + '000' + alarmFrame.FrameId + imageSuffix
                    Images.Save(path, '/images/security/', 'last.jpg', true)
                        .then(response => {
                            event.image = response + '?=' + new Date().getTime()
                            resolve(event)
                        })
                })
            })
        })
    },

    CurrentImage: (id) => {
        return new Promise((resolve, reject) => {            
            cameras()
                .then(cameras => {
                    var cam = cameras.filter(obj => {
                        return obj.id == id
                    })
                    Images.Save(cam[0].source, '/images/security/', id + '.jpg', true)
                        .then(response => {
                            resolve(response)
                        })
                })            
        })
    },

    CurrentImages: () => {
        var cams = cameras()
        return new Promise((resolve, reject) => {
            Promise.all([
                CurrentImage(cams[0]),
                CurrentImage(cams[1])
            ]).then(data => {
                resolve(data)
            })
        })
    },

    ToggleState: () => {
        return new Promise((resolve, reject) => {
            module.exports.Status()
                .then(status => {
                    var state = status.result == 0 ? 'start' : 'stop'
                    request.post(ZM.Api + 'states/change/' + state + '.json', (err, reponse, body) => {
                        if(err) reject('error')
                        resolve(reponse)
                    })
                })
        })
    }
}