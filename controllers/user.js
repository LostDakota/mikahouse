const APP = require('express')()

let User = require('../models/User')

APP.get('/api/users/list', (req, res) => {
    User.List()
        .then(users => {
            res.json(users);
        });
});

module.exports = APP;