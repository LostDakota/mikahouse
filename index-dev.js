const APP = require('express')();

// let comp = require('compression');
// let js = require('./components/JobServer');

APP.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// APP.use(comp({level: 9}));

// APP.use(require('./controllers/auth'));

APP.use(require('express').static('./public'));

APP.use(require('./controllers'));

APP.get('*', (req, res) => {
    res.redirect('/')
});

APP.listen(1338, () => {});