const Media = require('../models/Media');
const APP = require('express')();

APP.get('/api/media/newest/:limit?', (req, res) => {
    Media.Newest(req.params.limit)
        .then(response => {
            res.json(response);
        }).catch(err => {
            res.json({error: err});
        });
});

APP.get('/api/media/movies', (req, res) => {
    Media.Movies()
        .then(response => {
            res.json(response);
        });
});

APP.get('/api/media/nowplaying', (req, res) => {
    Media.NowPlaying()
        .then(response => {
            res.json(response);
        });
});

module.exports = APP;