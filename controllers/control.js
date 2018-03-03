'use strict'

const APP = require('express')()

let Control = require('../models/Control')

APP.get('/api/control/garage', (req, res) => {
    Control.Garage()
        .then(response => {
            res.json(response)
        })
})

module.exports = APP