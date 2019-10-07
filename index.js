const express = require('express');

const adapt = require('express-adaptive-images');
const cookieParser = require('cookie-parser');

const APP = express();
APP.use(cookieParser());

var defaultOptions = {
    imageTypes: [ '.jpg', '.png', '.jpeg', '.gif' ],
    breakpoints: [ 768, 480 ],
    cachePath: 'ai-cache',
    watchCache: true,
    cachePeriod: 60 * 60 * 24 * 7, // 7 days in seconds
    setExpirationHeaders: true,
    useImageMagick: true,
    debug: false
};

let staticPath = __dirname + '/public';
APP.use(adapt(staticPath, defaultOptions));

APP.use(express.json());

let comp = require('compression');
let js = require('./components/JobServer');

APP.use(comp({level: 9}));

APP.use(require('./controllers/public'));

APP.use(require('./controllers/auth'));

APP.use(require('express').static('./public'));

APP.use(require('./controllers'));

APP.get('*', (req, res) => {
    res.redirect('/')
});

APP.listen(1337, () => {});