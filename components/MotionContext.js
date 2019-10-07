let config = require('../.config.js');
let mysql = require('mysql');

let pool = mysql.createPool({
  connectionLimit: 50,
  host     : config.Motion.Host,
  user     : config.Motion.DbUser,
  password : config.Motion.Password,
  database : config.Motion.Database,
  port     : config.Motion.Port
});

module.exports = pool;