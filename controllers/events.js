const APP = require('express')()

let Events = require('../models/Events')

APP.get('/api/events', (req, res) => {
    Events.GetNotifications()
        .then(results => {
            res.json(results)
        })
})

APP.get('/api/events/:number', (req, res) => {
    Events.LastN(req.params.number)
        .then(results => {
            res.json(results)
        })
})

module.exports = APP