const Climate = require('../models/Climate')
const APP = require('express')()

APP.get('/api/climate/thermostat', (req, res) => {
    Climate.Thermostat()
        .then(response => {
            res.json(response)
        })
})

APP.post('/api/climate/thermostat/:temperature', (req, res) => {
    Climate.Control(req.params.temperature)
        .then(response => {
            res.sendStatus(200)
        })
})

module.exports = APP