const APP = require('express')()

let Server = require('../models/Server')

APP.get('/api/server/ping', (req, res) => {
    Server.Ping()
        .then((response) => {
            res.json(response)
        })
})

APP.get('/api/server/load', (req, res) => {
    Server.Load()
        .then((response) => {
            res.json(response)
        })
})

APP.get('/api/server/uptime', (req, res) => {
    Server.Uptime()
        .then((response) => {
            res.json(response)
        })
})

APP.get('/api/server/drives', (req, res) => {
    Server.DiskUsage()
        .then(response => {
            res.json(response)
        })
})

APP.get('/api/server', (req, res) => {
    let promises = [Server.Ping(), Server.Load(), Server.Uptime()]

    Promise.all(promises)
        .then(data => {
            res.json(data);
        });
})

APP.get('/api/server/network', (req, res) => {
    Server.ListNetwork()
        .then(response => {
            res.json(response)
        })
})

APP.get('/api/server/connecteddevices', (req, res) => {
    Server.ConnectedDevices()
        .then(response => {
            res.json(response)
        })
})

module.exports = APP