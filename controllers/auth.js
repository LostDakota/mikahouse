const APP = require('express')()
const SECRET = require('../.config').Secret
const MCTX = require('../components/MikaHouseContext')

let User = require('../models/User')
let bodyParser = require('body-parser')
let jwt = require('jsonwebtoken')
let path = require('path');
let cookieParser = require('cookie-parser')

APP.use(bodyParser.json())
APP.use(bodyParser.urlencoded({ extended: true }))
APP.use(cookieParser())

let verify = token => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, SECRET, (err, decoded) => {
            if (err) reject(err)
            resolve('ok')
        })
    })
}

let sign = (userObj) => {
    return new Promise((resolve, reject) => {
        jwt.sign(userObj, SECRET, (err, token) => {
            if (err) reject(err)
            resolve(token)
        })
    })
}

let logInvalid = (username, password, ip) => {
    return new Promise((resolve, reject) => {
        MCTX.query('insert into invalid_attempts (username, password, address) values ("' + username + '", "' + password + '", "' + ip + '")', (err, rows, fields) => {
            if (err) reject(err)
            resolve('ok')
        });
    });
}

APP.get('/login', (req, res, next) => {
    res.sendFile(path.join(__dirname, '/../public/templates/login.html'));
});

APP.post('/login', (req, res) => {
    const ip = req.header('x-forwarded-for') || req.connection.remoteAddress
    let username = req.body.username.toLowerCase()
    let password = req.body.password
    let referrer = req.body.referrer
    let encPassword = new Buffer(password).toString('base64')
    User.UserObject(username, encPassword)
        .then(response => {
            sign(response)
                .then(token => {
                    res.cookie('authToken', token, {maxAge: new Date(Number(new Date()) + 315360000000)});
                    res.redirect(referrer || '/');
                })
                .catch(error => {
                    logInvalid(username, password, ip)
                    res.redirect('/login')
                })
        })
        .catch(() => {
            res.redirect('/login')
        })
})

APP.get('*', (req, res, next) => {
    var origin = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (origin.indexOf('192.168.1') > -1) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    } else if (req.cookies === undefined || req.cookies.authToken === undefined) {
        res.redirect('/login')
    } else {
        verify(req.cookies.authToken)
            .then(() => {
                next();
            })
            .catch(() => {
                res.redirect(403, '/login');
            })
    }
})

module.exports = APP;