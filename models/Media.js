const PLEX = require('../.config').Plex;
const fs = require('fs');
const PlexAPI = require('plex-api');
const client = new PlexAPI(PLEX);

const buildMovies = moviesObj => {
    return new Promise((resolve, reject) => {
        client.query(moviesObj.thumb).then(function (image) {
            let file = `${__dirname}/../public/images/thumbs/${moviesObj.ratingKey}.jpg`;
            moviesObj.thumb = `/images/thumbs/${moviesObj.ratingKey}.jpg`;
            if (!fs.existsSync(file)) {
                fs.writeFile(file, new Buffer(image), err => {
                    if (!err) {
                        resolve(moviesObj);
                    } else {
                        reject(err);
                    }
                })
            } else {
                resolve(moviesObj);
            }
        });
    });
}

const buildShows = show => {
    return new Promise((resolve, reject) => {
        let id = show.thumb.split('/').pop();
        let file = `${__dirname}/../public/images/thumbs/${id}.jpg`;
        let self = {
            name: show.grandparentTitle,
            showtitle: show.title,
            description: show.summary,
            fanart: `/images/thumbs/${id}.jpg`
        };
        if (fs.existsSync(file)) {            
            resolve(self);
        } else {
            client.query(show.thumb)
                .then(buff => {
                    fs.writeFileSync(file, new Buffer(buff), err => {
                        if (!err) resolve(self);
                        reject(err);
                    });
                });            
        }
    });
}

module.exports = {
    Newest: count => {
        return new Promise((resolve, reject) => {
            let promises = [];
            client.query(`/library/sections/1/recentlyAdded?X-Plex-Container-Start=0&amp;X-Plex-Container-Size=${count || 3}`)
                .then(data => {
                    data.MediaContainer.Metadata.slice(0, 3)
                        .forEach(show => promises.push(buildShows(show)));
                    Promise.all(promises)
                        .then(response => {
                            resolve(response);
                        });
                });
        });
    },
    Movies: () => {
        return new Promise((resolve, reject) => {
            var promises = [];
            client.query('/library/sections/2/recentlyAdded?X-Plex-Container-Start=0&amp;X-Plex-Container-Size=3')
                .then(dirs => {
                    let three = dirs.MediaContainer.Metadata.slice(0, 3);
                    three.forEach(movie => {
                        promises.push(buildMovies(movie));
                    });
                    Promise.all(promises)
                        .then(response => {
                            resolve(response);
                        })
                }, err => {
                    reject(err);
                });
        });
    },

    NowPlaying: () => {
        return new Promise((resolve, reject) => {
            client.query('/status/sessions')
                .then(response => {
                    if (response.MediaContainer.size === 1) {
                        let file = `${__dirname}/../public/images/art/${response.MediaContainer.Metadata[0].ratingKey}.jpg`;
                        client.query(response.MediaContainer.Metadata[0].art)
                            .then(image => {
                                fs.writeFile(file, new Buffer(image), err => {
                                    if (!err) {
                                        response.MediaContainer.Metadata[0].art = `/images/art/${response.MediaContainer.Metadata[0].ratingKey}.jpg`;
                                        resolve(response);
                                    }
                                });
                            });
                    } else {
                        resolve(response);
                    }
                }, err => {
                    reject(err);
                });
        });
    }
}