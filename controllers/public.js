const APP = require('express')();
const MCTX = require('../components/MikaHouseContext');

APP.get('/api/garage/opened', (req, res) => {
    MCTX.query('insert into garage_history (status) values (true)');
    res.status(200).send();
});

APP.get('/api/garage/closed', (req, res) => {
    MCTX.query('insert into garage_history (status) values (false)');
    res.status(200).send();
});

APP.get('/api/control/garage/sleepytime', (req, res) => {
    if(new Date().getHours() >= 22){
        MCTX.query('select status from garage_history order by id desc limit 1', (err, rows, fields) => {
            if(err) res.status(500).send();
            if(rows[0].status && new Date().getHours() >= 22){
                require('../models/Control').Garage();
                res.status(200).send();
            }
        });
    } else {
        console.log('not good!');
        res.status(200).send();
    }
})

module.exports = APP;