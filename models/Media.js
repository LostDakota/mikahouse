'use strict'

const SICKRAGE = require('../.config').SickRage

let request = require('request')
let fs = require('fs')
let Images = require('../services/Images')

var buildShows = (showObj) => {
    return new Promise((resolve, reject) => {
        var query = '?cmd=episode&indexerid=' + showObj.indexerid + '&season=' + showObj.season + '&episode=' + showObj.episode
        var fanart = '?cmd=show.getfanart&indexerid=' + showObj.indexerid        
        request.get(SICKRAGE.Host + SICKRAGE.Key + query, (err, response, body) => {
            if(err) reject('error')
            var show = JSON.parse(body).data
            Images.Save(SICKRAGE.Host + SICKRAGE.Key + fanart, '/images/fanart/', showObj.indexerid + '.jpg')
                .then(response => {
                    show.showtitle = showObj.show_name
                    show.fanart = response
                    resolve(show)
                })
            })
        })
}

module.exports = {
    Newest: (single) => {
        return new Promise((resolve, reject) => {
            var last = '/?cmd=history&limit=3&type=downloaded'
            request.get(SICKRAGE.Host + SICKRAGE.Key + last, (err, response, body) => {
                if(err) reject('error')
                var three = JSON.parse(body).data
                if(single){
                    resolve(buildShows(three[0]))
                }else{
                    Promise.all([
                        buildShows(three[0]),
                        buildShows(three[1]),
                        buildShows(three[2])
                    ]).then(results => {
                        resolve(results)
                    })                
                }                
            })
        })
    }
}