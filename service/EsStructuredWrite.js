const redis = require('redis');
const logger = require('../app/common/logger');
const { getAsync } = require('../app/common/utils.js');
const esClinet = require('../app/common/ESclient');
const config = require('../config/config.local.js');
const esDatadb = require('./EsDataDb');
const mysql = require('../common/mysql');

esDatadbHandel = esDatadb.EsDataDb_handel;

class EsStructuredWrite {
  constructor(index, type) {
    this.index = index;
    this.type = type;
  }
  saveRs(data) {
    esDatadbHandel.insertUpdateEsDb(this.index, this.type, data);
  }

  getCameraId(frameid) {
    // const sql = 'select * from  face where userId=' + frameid;
    // const args = [userId];
    // const data = await mysql.execQuery({ sql, args });
    // return data;
  }

  //开启读取redis结构化信息写入ES
  static async startLpAndSave(port = config.redis.port, host = config.redis.host) {
    const lp = redis.createClient(port, host);
    const esBusinessConfig = config.esBusinessConfig;
    esBusinessConfig.map(async val => {
      const ew = new EsStructuredWrite(val.index, val.type);
      const rslopopData = await getAsync((resolve, reject) => {
        lp.lpop(val.redisDataType.queueOut, function(err, data) {
          if (!err) {
            console.log(data);
            resolve(data);
          } else {
            logger.error('redis loop failed ' + err);
            reject(err);
          }
        });
      });
      if (rslopopData) {
        console.log(rslopopData);
        ew.saveRs(rslopopData);
      }
    });
    setTimeout(() => {
      EsStructuredWrite.startLpAndSave();
    }, 1000);
  }
}

module.exports.startLpAndSave = EsStructuredWrite.startLpAndSave;
