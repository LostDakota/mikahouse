const MCTX = require('../components/MikaHouseContext')

module.exports = {
    List: () => {
        return new Promise((resolve, reject) => {
            MCTX.query('select t.name, t.last_seen, t.status, t.image, l.latitude, l.longitude from tracker t inner join (select name, max(timestamp) max_time from location group by name) lo on t.name = lo.name inner join location l on lo.name = l.name and lo.max_time = l.timestamp order by lo.name', (err, rows, fields) => {
                if(err) reject(err)
                resolve(rows)
            })
        })
    }
}