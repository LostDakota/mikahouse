const ZM = require('../.config').ZoneMinder
const MCTX = require('../components/MikaHouseContext')
const ZCTX = require('../components/ZoneMinderContext')

let request = require('request')
let fs = require('fs')
let Images = require('../services/Images')
let Events = require('../models/Events')

let  guid = () => {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }

let cameras = () => {
    return new Promise((resolve, reject) => {
        MCTX.query('select * from cameras where active=1', (err, rows, fields) => {
            if(err) reject('error')
            resolve(rows)
        })
    })    
}

let buildEvent = eventId => {
    var event = {}
    var imageSuffix = '-capture.jpg'   
    var videoSuffix = '-r1-s0_5.mp4' 

    return new Promise((resolve, reject) => {
        request.get(ZM.Api + 'events/' + eventId + '.json', (err, response, body) => {
            if(err){
                reject(err)
            }else{
                var eventObj = JSON.parse(body).event            
                var alarmFrame = eventObj.Frame.find(element => {
                    return element.Type == 'Alarm'
                });

                if(alarmFrame){
                    var padding = '00000'.substr(0, 5 - alarmFrame.FrameId.length);
                    var imgPath = ZM.Url + eventObj.Event.BasePath + padding + alarmFrame.FrameId + imageSuffix
                    var videoPath = ZM.Url + eventObj.Event.BasePath + 'Event-' + eventId + videoSuffix
    
                    Promise.all([
                        Images.Save(videoPath, '/images/security/events/', eventId + '.mp4', false),
                        Images.Save(imgPath, '/images/security/events/', eventId + '.jpg', false)
                    ]).then(response => {
                        var search = (str, arr) => {
                            for (var i = 0; i < arr.length; i++){
                                if(arr[i].match(str)) return i;
                            }
                            return -1;
                        }
                        event.poster = response[search('jpg', response)]
                        event.video = response[search('mp4', response)]
                        event.time = eventObj.Event.EndTime;
                        resolve(event)
                    })
                } else {
                    reject({});
                }   
            }            
        })
    })
}

let find = (people, status) => {
    people.find(person => {
        return person.status === status
    })
}

module.exports = {
    DaysWithEvents: () => {
        return new Promise((resolve, reject) => {
            ZCTX.query('select date(`EndTime`) as day from Events group by date(`EndTime`) order by day desc', (err, rows, fields) => {
                if(err) reject(err)
                resolve(rows)
            })
        })
    },
    
    TodaysEvents: (day) => {
        return new Promise((resolve, reject) => {
            var date = new Date()
            var selectedDay = day === "undefined" ? date.toLocaleDateString() : day.split('T')[0]
            ZCTX.query('select Id from Events where date(EndTime) = "' + selectedDay + '" order by EndTime desc', (err, rows, fields) => {
                if(err) reject(err)
                var promises = []
                if(rows){
                    rows.forEach(element => {
                        promises.push(buildEvent(element.Id))                    
                    })
                    Promise.all(promises)
                        .then(response => {
                            resolve(response)
                        })
                }else{
                    reject('error')
                }
            })
        })
    },

    TodaysEventCount: () => {
        return new Promise((resolve, reject) => {
            ZCTX.query('select count(*) as count from Events where EndTime > curdate()', (err, rows, fields) => {
                if(err) reject(err)
                var count = rows ? rows[0].count : 0
                resolve(count)
            })
        })
    },

    LastEvent: () => {
        var imageSuffix = '-capture.jpg'
        return new Promise((resolve, reject) => {
            ZCTX.query('select Id from Events where AlarmFrames > 0 order by id desc limit 1', (err, rows, fields) => {
                if(err) reject(err)
                if(rows && rows[0]){
                    var id = rows[0].Id
                    var event = {}
                    request.get(ZM.Api + 'events/' + id + '.json', (err, response, body) => {
                        if(err){
                            reject(err)
                        }else{
                            var eventObj = JSON.parse(body).event;
                            
                            event.time = eventObj.Event.EndTime
                            var alarmFrame = eventObj.Frame.find(element => {
                                return element.Type == 'Alarm'
                            });

                            var padding = '00000'.substr(0, 5 - alarmFrame.FrameId.length);
                            var path = ZM.Url + eventObj.Event.BasePath + padding + alarmFrame.FrameId + imageSuffix
                            Images.Save(path, '/images/security/', 'last.jpg', true)
                                .then(response => {
                                    event.image = response + '?=' + new Date().getTime();
                                    resolve(event)
                                });
                        }
                    })
                }else{
                    resolve({});
                }
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
                            resolve(response + '?=' + new Date().getTime())
                        })
                })            
        })
    },

    CurrentImages: () => {
        return new Promise((resolve, reject) => {
            cameras()
                .then(response => {
                    Promise.all([
                        module.exports.CurrentImage(response[0].id),
                        module.exports.CurrentImage(response[1].id)
                    ]).then(data => {
                        resolve(data);
                    })
                    .catch(err => {
                        reject(err);
                    })
                })    
        })
    },

    Status: async () => {
        return new Promise((resolve, reject) => {
            request(ZM.Api + 'host/daemonCheck.json', (err, response, body) => {
                if(err){
                    reject(err)
                }else{
                    resolve(JSON.parse(body))
                }
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
    },    

    Auto: () => {
        return new Promise((resolve, reject) => {
            MCTX.query('select name, status, last_seen from tracker where device_id is not null', (err, rows, fields) => {
                if(err) reject(err)
                module.exports.Status()
                    .then(res => {
                        var status = res.result
                        var equiv = status === 0 ? 'Away' : 'Home'

                        var matches = rows.filter(person => person.status === equiv)
                        var match = rows.find(person => person.status === equiv)
                        
                        if(status === 1 && match != null){

                            module.exports.ToggleState()
                                .then(returnedState => {
                                    Events.SetEvent(match.name + ' returned. Disabling security.')
                                })
                        }else if(status === 0 && matches.length === 2){
                            function sortDates(a, b){
                                return a.last_seen.getTime() - b.last_seen.getTime()
                            }

                            rows.forEach(person => {
                                person.last_seen = new Date(person.last_seen)
                            })

                            var sorted = rows.sort(sortDates);
                            var last = sorted[sorted.length - 1]

                            module.exports.ToggleState()
                                .then(returnedState => {
                                    Events.SetEvent(last.name + ' left. Enabling security.')
                                })
                        }
                    })
                    .catch(err => {
                        reject(err)
                    })
            })
        })
    }
}