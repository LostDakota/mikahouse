const APP = require('express')();
let fs = require('fs');

fs.readdirSync(__dirname).forEach(file => {
    if(file === 'index.js' || file === 'auth.js') return;
    APP.use(require(`${__dirname}/${file}`));
});

module.exports = APP;