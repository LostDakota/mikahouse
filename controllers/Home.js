const APP = require('express')();

let promises = [
    require('../models/User').List(),
    require('../models/Security').LastEvent(),
    require('../models/Server').GetLiveStats(),
    require('../models/Media').Newest(),
    require('../models/Events').LastN(3)
]

APP.get('/api/homepage', (req, res) => {
    Promise.all(promises)
        .then(data => {
            res.json({
                users: data[0],
                lastevent: data[1],
                stats: data[2],
                newest: data[3],
                events: data[4]
            });
        });
});

module.exports = APP;