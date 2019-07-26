let config = require('../.config.js');
let mysql = require('mysql');

let pool = mysql.createPool({
  connectionLimit: 50,
  host     : config.Main.Host,
  user     : config.Main.DbUser,
  password : config.Main.Password,
  database : config.Main.Database
});

module.exports = pool;