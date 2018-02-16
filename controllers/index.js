'use strict'

let fs = require('fs')
let path = require('path')
let APP = require('express')()

console.log('Loading controllers...')

fs.readdirSync(__dirname).forEach((file) => {
    if(file === 'index.js') return
    console.log(file)
    APP.use(require(path.join(__dirname + "/" + file)))
})

module.exports = APP