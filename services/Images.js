'use strict'

const PUBLIC = __dirname + '/../public'

let fs = require('fs')
let request = require('request')

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
                            resolve(dest + name)
                        })
                    })
                }                    
            })        
        })        
    }
}