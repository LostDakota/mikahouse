const MCTX = require('../components/MikaHouseContext');
const CONFIG = require('../.config');
let ping = require('ping');
let os = require('os-utils');
let diskspace = require('diskspace');
let request = require('request');

let format = seconds => {
    function pad(s){
      return (s < 10 ? '0' : '') + s;
    }
    var hours = Math.floor(seconds / (60*60));
    var minutes = Math.floor(seconds % (60*60) / 60);
    var seconds = Math.floor(seconds % 60);
  
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

var driveSpace = driveLetter => {
    return new Promise((resolve, reject) => {
        diskspace.check('/mnt/' + driveLetter, (err, result) => {
            if(err) reject(err);
            resolve({
                letter: driveLetter.toUpperCase(),
                used: Math.floor((result.used / result.total) * 100),
                free: Math.floor((result.free / result.total) * 100)
            });
        });
    });
}

module.exports = {
    ConnectedDevices: () => {
        return new Promise((resolve, reject) => {
            MCTX.query('select ip, name, UNIX_TIMESTAMP(recorded) as date from network where recorded > now() - interval 1 minute', (err, rows, fields) => {
                if(err) reject(err);
                resolve(rows);
            });
        });
    },
    ListNetwork: () => {
        return new Promise((resolve, reject) => {
            MCTX.query('select ip, name, UNIX_TIMESTAMP(recorded) as date from network order by date desc', (err, rows, fields) => {
                if(err) reject(err);
                resolve(rows);
            });
        });
    },
    PollNetwork: () => {
        return new Promise((resolve, reject) => {
            request.get(`http://${CONFIG.ZoneMinder.Host}:88`, (err, response, body) => {
                if(err) reject(err);
                var devices = JSON.parse(body);
                if(devices == 'undefined'){
                    return reject(undefined);
                }                    
                devices.forEach(device => {
                    MCTX.query('insert into network (ip, mac) values ("' + device.ip + '", "' + device.mac + '") on duplicate key update recorded=values(recorded)', (err, rows, fields) => {
                        if(err) reject(err);
                    });
                });
                resolve(devices);
            });
        });
    },
    GetStats: () => {
        return new Promise((resolve, reject) => {
            MCTX.query('select * from server_stats', (err, rows, fields) => {
                if(err) reject(err);
                resolve(rows);
            });
        });
    },
    GetLiveStats: () => {
        return new Promise((resolve, reject) => {
            Promise.all([module.exports.Ping(), module.exports.Load(), module.exports.Uptime()])
            .then(data => {
                resolve(data);
            })
            .catch(err => reject(err));
        });        
    },
    Ping: construct => {
        return new Promise((resolve, reject) => {
            ping.promise.probe('google.com')
                .then((res) => {
                    if(construct) resolve({
                        Name: 'Ping',
                        Icon : "fa-wifi",
                        Value : res.avg
                    });
                    resolve({name: 'Ping', value: res.avg + 'ms'});
                })
                .catch(err => reject(err));
        });
    },
    Load: construct => {
        return new Promise((resolve, reject) => {
            os.cpuUsage(value => {
                if(construct) resolve({
                    Name: 'Load',
                    Icon: 'fa-balance-scale',
                    Value : Math.floor(value * 100) + '%'
                });
                resolve({name: 'Load', value: Math.floor(value * 100) + '%'});
            });
        });
    },
    Uptime: construct => {
        return new Promise((resolve, reject) => {
            var time = format(process.uptime())
            if(construct) resolve({
                Name: 'Uptime',
                Icon: 'fa-desktop',
                Value : time
            });
            resolve({name: 'Uptime', value: time});
            reject({});
        });
    },
    DiskUsage: () => {
        return new Promise((resolve, reject) => {
            Promise.all([
                driveSpace('c'),
                driveSpace('d'),
                driveSpace('e')
            ])
            .then(results => {
                resolve(results);
            })
            .catch(err => reject(err));
        });
    },
    RecordStats: () => {
        return new Promise((resolve, reject) => {
            Promise.all([
                module.exports.Ping(false),                
                module.exports.Load(false),
                module.exports.Uptime(false)
            ])
            .then(results => {
                results.forEach(stat => {
                    MCTX.query(`update server_stats set statistic="${stat.value}" where name="${stat.name}"`, (err, rows, fields) => {
                        if(err) reject(err);
                    });
                });
                resolve('ok');
            });
        });
    }
}