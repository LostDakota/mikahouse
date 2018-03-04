const APP = require('express')()
const SECRET = require('../.config').Secret
const MCTX = require('../components/MikaHouseContext')

let User = require('../models/User')
let bodyParser = require('body-parser')
let jwt = require('jsonwebtoken')
let fs = require('fs')
let cookieParser = require('cookie-parser')

APP.use(bodyParser.json())
APP.use(bodyParser.urlencoded({extended: true}))
APP.use(cookieParser())

let verify = (token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, SECRET, (err, decoded) => {
            if(err) reject(err)
            resolve('ok')
        })
    })
}

let sign = (userObj) => {
    return new Promise((resolve, reject) => {
        jwt.sign(userObj, SECRET, (err, token) => {
            if(err) reject(err)
            resolve(token)
        })
    })
}

let logInvalid = (username, password, ip) => {
    return new Promise((resolve, reject) => {
        MCTX.query('insert into invalid_attempts (username, password, address) values ("' + username + '", "' + password + '", "' + ip + '")', (err, rows, fields) => {
            if(err) reject(err)
            resolve('ok')
        })
    })
}

APP.get('/login', (req, res) => {
    var page = fs.readFileSync(__dirname + '/../public/templates/login.html')
    res.send(page.toString())
})

APP.post('/login', (req, res) => {
    var ip = req.header('x-forwarded-for') || req.connection.remoteAddress
    var username = req.body.username.toLowerCase()
    var password = req.body.password
    var encPassword = new Buffer(password).toString('base64')
    User.UserObject(username, encPassword)
        .then(response => {
            sign(response)
                .then(token => {
                    res.cookie('authToken', token)
                    res.redirect('/')
                })
                .catch(error => {
                    logInvalid(username, password, ip)
                    res.redirect('/login')
                })
        })
        .catch(error => {
            res.redirect('/login')
        })
})

APP.get('*', (req, res, next) => {
    if(req.cookies === undefined || req.cookies.authToken === undefined){
        res.redirect('/login')
    }else{
        verify(req.cookies.authToken)
            .then(response => {
                next()       
            })
            .catch(error => {
                console.log(error)
                res.redirect(403, '/login')
            })
    }
})

module.exports = APP