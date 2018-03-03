'use strict'

const PUBLIC = __dirname + '/../public'

let fs = require('fs')
let request = require('request')
let jimp = require('jimp')

var resize = (imagePath) => {
    return new Promise((resolve, reject) => {
        jimp.read(imagePath, (err, file) => {
            if(err) reject(err)
            file.resize(300, jimp.AUTO)
                .quality(50)
                .write(imagePath)
            resolve('ok')
        })
        .catch(err => {
            reject(err)
        })
    })
}

module.exports = {
    Save: (input, dest, name, overwite) => {
        var imagePath = PUBLIC + dest + name
        return new Promise((resolve, reject) => {
            fs.exists(imagePath, exists => {
                if(exists && !overwite){
                    resolve(dest + name)
                }else{
                    request.get({url: input, encoding: 'binary'}, (err, response, body) => {
                        if(err) reject('error')
                        fs.writeFile(PUBLIC + dest + name, body, 'binary', (err) => {
                            if(err) reject('error')
                            if(imagePath.indexOf('mp4') === -1){
                                resize(imagePath)
                                    .then(response => {
                                        resolve(dest + name)
                                    })
                            }else{
                                resolve(dest + name)
                            }
                        })
                    })
                }                    
            })        
        })        
    }
}