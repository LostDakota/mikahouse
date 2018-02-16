'use strict'

const APP = require('express')()

let User = require('../models/User')
let Prefix = '/api/users/'

APP.get(Prefix  + 'list', (req, res) => {
    User.List()
        .then(users => {
            res.json(users)
        })
})

module.exports = APP