const APP = require('express')();
let Control = require('../models/Control');
let Climate = require('../models/Climate');

APP.get('/api/control/garage', (req, res) => {
    Control.Garage()
        .then(response => {
            res.json(response);
        })
        .catch(err => {
            res.status(500).send(err);
        });
});

APP.get('/api/control/garage/status', (req, res) => {
    Control.GarageStatus()
        .then(response => {
            res.json(response[0]);
        });
});

APP.get('/api/control/thermostat', (req, res) => {
    Climate.Thermostat()
        .then(response => {
            res.json(response);
        });
});

APP.post('/api/control/thermostat/:temperature', (req, res) => {
    Climate.Control(req.params.temperature)
        .then(response => {
            res.json(response);
        });
});

module.exports = APP;