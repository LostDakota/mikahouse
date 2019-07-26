const MCTX = require('../components/MikaHouseContext');

module.exports = {
    GetNotifications: () => {
        return new Promise((resolve, reject) => {
            var promises = []
            MCTX.query('select notif, UNIX_TIMESTAMP(date) as date from notifications where date > curdate() order by date desc', (err, rows, fields) => {
                if(err) reject(err);
                rows.forEach(row => {
                    row.image = row.notif.split(' ')[0].toLowerCase();
                });
                resolve(rows);
            });
        });
    },

    LastN: (number) => {
        return new Promise((resolve, reject) => {
            MCTX.query(`select notif, UNIX_TIMESTAMP(date) as date from notifications order by date desc limit ${number}`, (err, rows, fields) => {
                if(err) reject(err);
                resolve(rows);
            })
        })
    },

    SetEvent: (action) => {
        return new Promise((resolve, reject) => {
            MCTX.query(`insert into notifications (notif) values ("${action}")`, (err, rows, fields) => {
                if(err) reject(err);
                resolve(rows);
            })
        })
    }
}