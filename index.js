const APP = require('express')()

let comp = require('compression')
let js = require('./components/JobServer')

APP.use(comp({level: 9}))

APP.use(require('./controllers/auth'))

APP.use(require('express').static('public', {maxAge: '1w'}))

APP.use(require('./controllers'))

APP.get('*', (req, res) => {
    res.redirect('/')
})

APP.listen(1337, () => {})