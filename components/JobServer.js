const AGENDA = require('agenda')
const MongoClient = require('mongodb')
const USER = require('../models/User')
const SERVER = require('../models/Server')
const SECURITY = require('../models/Security')

async function run(){
    const db = await MongoClient.connect("mongodb://localhost:27017/jobserver")
    const agenda = new AGENDA().mongo(db, 'jobs')

    agenda.define('detect', () => {
        USER.Detect()
    })

    agenda.define('recordStats', () => {
        SERVER.RecordStats()
        SERVER.PollNetwork()
    })

    agenda.define('zoneminder', () => {
        SECURITY.Auto()
    })

    agenda.on('ready', () => {
        agenda.every('minute', 'detect')
        agenda.every('minute', 'recordStats')
        agenda.every('minute', 'zoneminder')
    })

    agenda.start()
}

run().catch(error => {
    console.error(error)
    // process.exit(-1)
})

module.exports = run