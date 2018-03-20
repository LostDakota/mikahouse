const APP = require('express')()

let Control = require('../models/Control')
let Climate = require('../models/Climate')

APP.get('/api/control/garage', (req, res) => {
    Control.Garage()
        .then(response => {
            res.json(response)
        })
})

APP.get('/api/control/thermostat', (req, res) => {
    Climate.Thermostat()
        .then(response => {
            res.json(response)
        })
})

APP.post('/api/control/thermostat/:temperature', (req, res) => {
    Climate.Control(req.params.temperature)
        .then(response => {
            res.sendStatus(200)
        })
})

module.exports = APP