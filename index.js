let cluster = require('cluster')
let app = require('express')()
let comp = require('compression')
let js = require('./components/JobServer')

app.use(comp())

app.use(require('./controllers/auth'))

app.use(require('express').static('public'))

app.use(require('./controllers'))

app.get('*', (req, res) => {
    res.redirect('/')
})

// if(cluster.isMaster){
//     console.log(`Master ${process.pid} is running`)
//     for(let i = 0; i < 2; i++){
//         cluster.fork()
//     }
//     cluster.on('exit', (worker, code, signal) => {
//         console.log(`Worker ${worker.process.pid} died`)
//     })
// }else{
//     app.listen(1337, () => {})
// }

app.listen(1337, () => {})