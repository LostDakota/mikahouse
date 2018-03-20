const SICKRAGE = require('../.config').SickRage
const PLEX = require('../.config').Plex
const MCTX = require('../components/MikaHouseContext')

let request = require('request')
let fs = require('fs')
let PlexAPI = require('plex-api')
let Images = require('../services/Images')

var client = new PlexAPI(PLEX);

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

var buildMovies = (moviesObj) => {
    return new Promise((resolve, reject) => {
        client.query(moviesObj.thumb).then(function(image){
            var file = __dirname + '/../public/images/thumbs/' + moviesObj.ratingKey + '.jpg'
            fs.writeFile(file, new Buffer(image), err => {
                if(!err){
                    moviesObj.thumb = '/images/thumbs/' +moviesObj.ratingKey + '.jpg'
                    resolve(moviesObj)
                }else{
                    reject(err)
                }
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
    },
    Movies: () => {
        return new Promise((resolve, reject) => {
            var promises = []
            client.query('/library/sections/2/recentlyAdded?X-Plex-Container-Start=0&amp;X-Plex-Container-Size=3')
                .then(function(dirs){
                    var three = dirs.MediaContainer.Metadata.slice(0,3)
                    three.forEach(movie => {
                        promises.push(buildMovies(movie))
                    })
                    Promise.all(promises)
                        .then(response => {
                            resolve(response)
                        })
                }, function(err){
                    reject(err)
                })
        })
    },

    NowPlaying: () => {
        return new Promise((resolve, reject) => {
            client.query('/status/sessions')
                .then(response => {
                    if(response.MediaContainer.size === 1){
                        var file = __dirname + '/../public/images/art/' + response.MediaContainer.Metadata[0].ratingKey + '.jpg'
                        client.query(response.MediaContainer.Metadata[0].art)
                            .then(image => {
                                fs.writeFile(file, new Buffer(image), err => {
                                    if(!err){
                                        response.MediaContainer.Metadata[0].art = '/images/art/' + response.MediaContainer.Metadata[0].ratingKey + '.jpg'
                                        resolve(response)
                                    }
                                })
                            })
                    }else{
                        resolve(response)
                    }
                }, err => {
                    reject(err)
                })
        })
    }
}