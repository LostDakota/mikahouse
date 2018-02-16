'use strict'

const GARAGE = require('../.config').Garage

let request = require('request')

module.exports = {
    Garage: () => {
        return new Promise((resolve, reject) => {
            request.get(GARAGE, (err, response, body) => {
                if(err) reject('error')
                resolve(body)
            })
        })
    }
}