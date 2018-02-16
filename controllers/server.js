'use strict'

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
    Promise.all([
        Server.Ping(true),
        Server.Load(true),
        Server.Uptime(true)
    ]).then(result => {
        res.json(result)
    })
})

module.exports = APP