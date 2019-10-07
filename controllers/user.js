const express = require('express');

const APP = express();
APP.use(express.json());

let User = require('../models/User')

APP.get('/api/users/list', (req, res) => {
    User.List()
        .then(users => {
            res.json(users);
        });
});

APP.post('/api/users/location/:name/:latitude/:logitude', (req, res) => {
    res.send(req.body);
});

module.exports = APP;