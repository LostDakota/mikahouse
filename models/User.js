const MCTX = require('../components/MikaHouseContext')

let ping = require('ping')

let RecordChange = (action) => {
    return new Promise((resolve, reject) => {
        MCTX.query('insert into notifications (notif) values ("' + action + '")', (err, rows, fields) => {
            if(err) reject(err)
            resolve(rows)
        })
    })
}

let RecordOccupancy = (username, isHome) => {
    return new Promise((resolve, reject) => {        
        var status = isHome ? 'Home' : 'Away'
        MCTX.query('select * from tracker where name="' + username + '"', (err, rows, fields) => {
            if(status != rows[0].status){
                MCTX.query('update tracker set status="' + status + '", last_seen=NOW() where name="' + username + '"', (err, rows, fields) => {
                    if(err) reject('error')
                    resolve(rows)
                })
            }
        })        
    })
}

module.exports = {
    Ping: (username, ip) => {
        return new Promise((resolve, reject) => {
            ping.sys.probe(ip, isAlive => {
                MCTX.query('insert into occupancy (username, is_home) values ("' + username + '", ' + isAlive + ')', (err, rows, fields) => {
                    if(err) reject(err)
                    resolve(rows)
                    module.exports.CalculateValidity(username)
                })
            })
        })
    },
    List: () => {
        return new Promise((resolve, reject) => {
            MCTX.query('select t.name, t.last_seen, t.status, t.image, l.latitude, l.longitude from tracker t inner join (select name, max(timestamp) max_time from location group by name) lo on t.name = lo.name inner join location l on lo.name = l.name and lo.max_time = l.timestamp order by lo.name', (err, rows, fields) => {
                if(err) reject(err)
                resolve(rows)
            })
        })
    },
    Detect: () => {
        return new Promise((resolve, reject) => {
            MCTX.query('select username, ip_address from users where ip_address is not null', (err, rows, fields) => {
                if(err) reject('error')
                var promises = []
                rows.forEach(row => {
                    promises.push(module.exports.Ping(row.username, row.ip_address))
                })
                Promise.all(promises)
                    .then(result => {
                        resolve(result)                        
                    })
            })
        })
    },
    CalculateValidity: (username) => {
        return new Promise((resolve, reject) => {
            MCTX.query('select o.is_home, u.ip_address from occupancy o join users u on o.username = u.username where o.username="' + username + '" order by o.id desc limit 3', (err, rows, fields) => {
                if(err) reject(err)
                MCTX.query('select recorded from network where ip="' + rows[0].ip_address + '" and recorded > now() - interval 1 minute', (err, row, fields) => {
                    if(err) reject(err)
                    var total = 0;
                    var init = 150;
                    total = row[0] !== undefined ? 300 : 0
                    for(var i = 0; i < rows.length; i++){
                        if(rows[i].is_home === 1 && i === 0){
                            total = 200
                        }else if(rows[i].is_home === 1){
                            total += init;
                        }else{
                            total += 50;
                        }
                        init -= 50
                    }
                    var average = Math.round(total / rows.length)
                    var perc = average > 100 ? 100 : average
                    var truth = perc >= 67 ? true : false
                    RecordOccupancy(username, truth)
                        .then(result => {
                            resolve(result)
                        })
                })
            })
        })
    },
    UserObject: (username, password) => {
        return new Promise((resolve, reject) => {
            MCTX.query('select id, username, email from users where LOWER(username)="' + username + '" and password="' + password + '"', (err, rows, fields) => {
                if(err) reject(err)
                resolve({
                    id: rows[0].id,
                    username: rows[0].username,
                    email: rows[0].email
                })
            })
        })
    }
}