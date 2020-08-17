const redis = require('redis');
const config = require('./../../config/config.local.js');
const logger = require('./common/logger');
const client = redis.createClient(config.redis.port, config.redis.host, config.redis.opt);

client.on('connect', function() {
  logger.info('redis connect');
});

client.on('error', function(err) {
  logger.error('redisError' + err);
});

const auth = () => {
  client.auth(config.redis.passwd, function() {
    logger.info('通过认证');
  });
};

const setKey = (key, value) => {
  return new Promise((resolve, reject) => {
    client.set(key, value, (err, replay) => {
      if (err) {
        reject(err);
      } else {
        resolve(replay);
      }
    });
  });
};

const getKey = key => {
  return new Promise((resolve, reject) => {
    client.get(key, (err, replay) => {
      if (err) {
        reject(err);
      } else {
        resolve(replay);
      }
    });
  });
};

module.exports = {
  client,
  setKey,
  getKey,
  auth,
};
