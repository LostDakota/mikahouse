const APP = require('express')();
let Security = require('../models/Security')

let promises = [
    Security.CurrentImages(),
    Security.DaysWithEvents(),
    Security.IsMotionRunning(),
    Security.TodaysEventCount()
]

APP.get('/api/security', (req, res) => {
    Promise.all(promises)
        .then(response => {
            res.json({
                cameras: response[0],
                days: response[1],
                status: response[2],
                eventCount: response[3]
            });
        });
});

APP.get('/api/security/motion', (rea, res) => {
    Security.LastFromMotion()
        .then(response => {
            res.json(response);
        });
});

APP.get('/api/security/lastevent', (req, res) => {
    Security.LastEvent()
        .then(response => {
            res.json(response);
        });
});

APP.get('/api/security/todaysevents/:day', (req, res) => {
    Security.TodaysEvents(req.params.day)
        .then(response => {
            res.json(response);
        });
});

APP.get('/api/security/todayseventcount', (req, res) => {
    Security.TodaysEventCount()
        .then(response => {
            res.json(response);
        });
});

APP.get('/api/security/days', (req, res) => {
    Security.DaysWithEvents()
        .then(response => {
            res.json(response);
        });
});

APP.get('/api/security/status', (req, res) => {
    Security.IsMotionRunning()
        .then(response => {
            res.json(response);
        });
});

APP.get('/api/security/camera/:id', (req, res) => {
    Security.CurrentImage(req.params.id)
        .then(response => {
            res.send(response);
        });
});

APP.get('/api/security/cameras', (req, res) => {
    Security.CurrentImages()
        .then(response => {
            res.send(response);
        });
});

APP.get('/api/security/state', (req, res) => {
    Security.ToggleState()
        .then(response => {
            res.json(response);
        });
});

module.exports = APP;