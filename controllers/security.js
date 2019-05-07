const APP = require('express')()

let Security = require('../models/Security')

let promises = [
    Security.CurrentImage(1),
    Security.CurrentImage(2),
    Security.DaysWithEvents(),
    Security.Status(),
    Security.TodaysEventCount()
]

APP.get('/api/security', (req, res) => {
    Promise.all(promises)
        .then(response => {
            res.json({
                cameras: [response[0], response[1]],
                days: response[2],
                status: response[3].result,
                eventCount: response[4]
            });
        });
});

APP.get('/api/security/lastevent', (req, res) => {
    Security.LastEvent()
        .then(response => {
            res.json(response)
        })
})

APP.get('/api/security/todaysevents/:day', (req, res) => {
    Security.TodaysEvents(req.params.day)
        .then(response => {
            res.json(response)
        })
})

APP.get('/api/security/todayseventcount', (req, res) => {
    Security.TodaysEventCount()
        .then(response => {
            res.json(response)
        })
})

APP.get('/api/security/days', (req, res) => {
    Security.DaysWithEvents()
        .then(response => {
            res.json(response)
        })
})

APP.get('/api/security/status', (req, res) => {
    Security.Status()
        .then(response => {
            res.json(response)
        })
})

APP.get('/api/security/camera/:id', (req, res) => {
    Security.CurrentImage(req.params.id)
        .then(response => {
            res.send(response)
        })
})

APP.get('/api/security/cameras', (req, res) => {
    Security.CurrentImages()
        .then(response => {
            res.send(response);
        })
})

APP.get('/api/security/state', (req, res) => {
    Security.ToggleState()
        .then(response => {
            res.json(response)
        })
})

module.exports = APP