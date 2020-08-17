const mysql = require('mysql');
const config = require('./../../config/config.local.js');
const logger = require('./logger');
var connectionPool = mysql.createPool({
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  database: config.database.database,
  // 'charset': config.database.charset,
  // 'connectionLimit': config.database.connectionLimit,
  supportBigNumbers: true,
  bigNumberStrings: true,
  multipleStatements: true,
});

var release = connection => {
  connection.end(function(error) {
    if (error) {
      logger.info('Connection closed failed.');
    } else {
      logger.info('Connection closed succeeded.');
    }
  });
};

var execQuery = sqlOptions => {
  var results = new Promise((resolve, reject) => {
    connectionPool.getConnection((error, connection) => {
      if (error) {
        logger.info('Get connection from mysql pool failed !');
        reject(error);
        return;
      }

      var sql = sqlOptions['sql'];
      var args = sqlOptions['args'];

      if (!args) {
        var query = connection.query(sql, (error, results) => {
          if (error) {
            logger.info('Execute query error !');
            reject(error);
          }
          resolve(results);
        });
      } else {
        var query = connection.query(sql, args, function(error, results) {
          if (error) {
            logger.info('Execute query error !');
            reject(error);
          }

          resolve(results);
        });
      }

      connection.release(function(error) {
        if (error) {
          logger.info('Mysql connection close failed !');
          reject(error);
        }
      });
    });
  }).then(function(chunk) {
    return chunk;
  });

  return results;
};

module.exports = {
  release: release,
  execQuery: execQuery,
};
