const esClient = require('../common/ESClient.js');
const constent = require('../../config/Constent.js');
const config = require('../../config/config.local');
const utlis = require('../common/utils');
const moment = require('moment');
const esUtil = require('../common/esUtil.js');
const logger = require('../common/logger');

//ecstore 存贮提取接口
class ECstoreService {
  constructor(params) {
    this.mustArray = [];
  }
}
module.exports = ECstoreService;
