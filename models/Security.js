const MCTX = require('../components/MikaHouseContext');
const exec = require('child_process').exec;
const Events = require('../models/Events');

module.exports = {
    Video: id => {
        return new Promise((resolve, reject) => {
            MCTX.query(`select * from motion where filename like '%${id}.mp4'`, (err, rows, fields) => {
                if(err) reject(err);
                resolve(rows);
            })
        })
    },
    
    LastFromMotion: () => {
        return new Promise((resolve, reject) => {
            MCTX.query('select * from motion where camera = 1 order by time_stamp desc limit 1', (err, rows, fields) => {
                if(err) reject(err);
                resolve(rows);
            })
        })
    },

    DaysWithEvents: () => {
        return new Promise((resolve, reject) => {
            MCTX.query('select date(time_stamp) as day from motion group by date(time_stamp) order by day desc', (err, rows, fields) => {
                if(err) reject(err);
                resolve(rows);
            })
        })
    },

    TodaysEvents: (day, pageSize) => {
        return new Promise((resolve, reject) => {
            var date = new Date();
            pageSize = pageSize || 10
            var selectedDay = day === 'undefined' ? date.toLocaleDateString() : day.split('T')[0];
            MCTX.query(`select * from motion where date(event_time_stamp) = "${selectedDay}" order by event_time_stamp desc`, (err, rows, fields) => {
                if(err) reject(err);
                let events = [];
                let movies = rows.filter(row => row.file_type === 8);
                let posters = rows.filter(row => row.file_type === 1);
                movies.forEach((movie, i) => {
                    if(posters[i]){
                        events.push({
                            id: movie.filename.split('/').pop().split('.')[0],
                            movie: movie.filename.replace('/mnt/d', ''),
                            stamp: movie.event_time_stamp,
                            poster: posters[i].filename.replace('/mnt/d', '')
                        });
                    }                    
                });
                resolve(events);
            });
        });
    },

    TodaysEventCount: () => {
        return new Promise((resolve, reject) => {
            MCTX.query('select count(*) as count from motion where event_time_stamp > curdate() and filename like "%mp4"', (err, rows, fields) => {
                if(err) reject(err);

                var count = rows ? rows[0].count : 0;
                resolve(count);
            })
        })
    },

    LastEvent: () => {
        return new Promise((resolve, reject) => {
            MCTX.query('select * from motion where filename like "%.jpg" order by event_time_stamp desc limit 1', (err, rows, fields) => {
                if(err) reject(err);
                if(rows && rows.length > 0){
                    resolve({
                        time: rows[0].event_time_stamp,
                        image: rows[0].filename.replace('/mnt/d', '/images')
                    });
                }                
                resolve({
                    time: new Date(),
                    image: '/images/motion/lastsnap.jpg'
                });
            });
        });
    },

    CurrentImages: () => {
        let ts = Math.round(new Date().getTime() / 1000);
        return new Promise((resolve, reject) => {
            resolve([
                {name: 'Back Room', image: `/images/motion/backroom.jpg?ts=${ts}`},
                {name: 'Living Room', image: `/images/motion/livingroom.jpg?ts=${ts}`},
                {name: 'Garage', image: `/images/motion/garage.jpg?ts=${ts}`}
            ]);
            reject();
        });
    },
    
    IsMotionRunning: () => {
        return new Promise((resolve, reject) => {
            exec(`ps -aux | grep motion | grep -v grep`, (err, stdout, stderr) => {
                if(err) reject('error');
                resolve({
                    result: (stdout && stdout.length > 0) && stdout.indexOf('disabled') === -1 ? 1 : 0
                });
            })
        });
    },

    ToggleState: () => {
        return new Promise((resolve, reject) => {
            module.exports.IsMotionRunning()
                .then(status => {
                    if(status.result === 1){
                        exec('pkill motion', () => {
                            exec('motion -m -c /usr/local/motion/motion.disabled.conf');
                        });
                    } else {
                        exec('pkill motion', () => {
                            exec('motion -c /usr/local/motion/motion.conf');
                        });
                    }
                    resolve('ok');
                })
                .catch(err => reject(err));
        });
    },

    Auto: () => {
        return new Promise((resolve, reject) => {
            MCTX.query('select name, status, last_seen from tracker where device_id is not null order by last_seen desc', (err, rows, fields) => {
                if(err){
                    reject(err);
                };
                module.exports.IsMotionRunning()
                    .then(res => {
                        let anyoneHome = rows.filter(person => person.status === 'Home');

                        if(res.result === 1 && anyoneHome.length > 0) {
                            module.exports.ToggleState()
                                    .then(() => {
                                        Events.SetEvent(`${rows[0].name} returned. Disabling security.`);
                                    });
                        } else if(res.result === 0 && anyoneHome.length === 0) {
                            module.exports.ToggleState()
                                    .then(() => {
                                        Events.SetEvent(`${rows[0].name} left. Enabling security.`);
                                    });
                        }
                        resolve('success');
                    })
                    .catch(err => {
                        reject(err);
                    });
            });
        });
    }
}