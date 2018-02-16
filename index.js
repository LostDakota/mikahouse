'use strict'
let app = require('express')()
let comp = require('compression')

app.use(comp())
app.use(require('express').static('public', {maxAge: 86400000}))

app.use(require('./controllers'))

app.get('*', (req, res, next) => {
    res.redirect('/')
})

app.listen(1337, () => {})