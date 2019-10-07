const PUBLIC = __dirname + '/../public';

let fs = require('fs');
let request = require('request');
let sharp = require('sharp');

let resize = (imagePath) => {
    return new Promise((resolve, reject) => {
        sharp(imagePath)
            .resize(400)
            .toFile(imagePath.replace('jpg', 'webp'))
            .then(() => {
                resolve('ok');
            })
            .catch(err => {
                reject(err);
            });
    });
}

let writeFile = (path, body) => {
    fs.writeFile(path, body, 'binary', (err) => {
        if(err) return false;
        if(path.indexOf('mp4') === -1) {
            resize(path)
                .then(() => {
                    return true;
                });
        } else {
            return true;
        }
    });
}

let comparer = (imagePath, streamUrl) => {
    let stats = fs.statSync(imagePath)["size"];
    request.get({url: streamUrl, encoding: 'binary'}, (err, response, body) => {
        if(stats !== body.length) {
            writeFile(imagePath, body);
        }
    });
}

module.exports = {
    Save: (input, dest, overwite) => {
        let imagePath = `${PUBLIC}${dest}`;
        return new Promise((resolve, reject) => {
            fs.exists(imagePath, exists => {
                if(exists && !overwite){
                    comparer(imagePath, input);
                    resolve(`${dest}`);
                }else{
                    request.get({url: input, encoding: 'binary'}, (err, response, body) => {
                        if(err) reject('error')
                        let finalDestination = `${PUBLIC}${dest}`;
                        fs.writeFile(finalDestination, body, 'binary', (err) => {
                            if(err) reject('error');
                            if(imagePath.indexOf('mp4') === -1) {
                                resolve(`${dest}`);
                            }else{
                                resolve(`${dest}`);
                            }
                        });
                    });
                }                    
            });        
        });        
    }
}