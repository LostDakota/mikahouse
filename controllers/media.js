'use strict'

const Media = require('../models/Media')
const APP = require('express')()

let request = require('request')

APP.get('/api/media/newest/:single?', (req, res) => {
    Media.Newest(req.params.single)
        .then(response => {
            res.json(response)
        })
})

module.exports = APP