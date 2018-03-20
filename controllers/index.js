const APP = require('express')()

let fs = require('fs')
let path = require('path')

console.log('Loading controllers...')

fs.readdirSync(__dirname).forEach((file) => {
    if(file === 'index.js' || file === 'auth.js') return
    console.log(file)
    APP.use(require(path.join(__dirname + "/" + file)))
})

module.exports = APP