const APP = require('express')()

let cluster = require('cluster')
let comp = require('compression')
let js = require('./components/JobServer')

APP.use(comp())

APP.use(require('./controllers/auth'))

APP.use(require('express').static('public'))

APP.use(require('./controllers'))

APP.get('*', (req, res) => {
    res.redirect('/')
})

if(cluster.isMaster){
    console.log(`Master ${process.pid} is running`)
    for(let i = 0; i < 2; i++){
        cluster.fork()
    }
    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`)
    })
}else{
    APP.listen(1337, () => {})
}

// APP.listen(1337, () => {})