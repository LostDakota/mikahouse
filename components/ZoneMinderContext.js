let config = require('../.config.js');
let mysql = require('mysql');

var pool = mysql.createPool({
  connectionLimit: 50,
  host     : config.ZoneMinder.Host,
  user     : config.ZoneMinder.DbUser,
  password : config.ZoneMinder.Password,
  database : config.ZoneMinder.Database
});

module.exports = pool;