const GARAGE = require('../.config').Garage;
const MCTX = require('../components/MikaHouseContext');
let request = require('request');

module.exports = {
    Garage: () => {
        return new Promise((resolve, reject) => {
            request.get(GARAGE, (err, response, body) => {
                if(err) reject(err);
                resolve(body);
            })
        })
    },
    GarageStatus: () => {
        return new Promise((resolve, reject) => {
            MCTX.query('select status from garage_history order by id desc limit 1', (err, rows, fields) => {
                if(err) reject(err);
                resolve(rows);
            });
        });
    }
}