const APP = require('express')()

let fs = require('fs')
let path = require('path')

fs.readdirSync(__dirname).forEach((file) => {
    if(file === 'index.js' || file === 'auth.js') return
    APP.use(require(path.join(__dirname + "/" + file)))
})

module.exports = APP