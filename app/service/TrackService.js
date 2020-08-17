const esClient = require('../common/ESClient.js');
const constent = require('../../config/Constent.js');
const config = require('../../config/config.local');
const utlis = require('../common/utils');
const jsonUtils = require('../common/JsonUtils.js');
const moment = require('moment');
const esUtil = require('../common/esUtil.js');
const logger = require('../common/logger');

class TrackService {
  constructor(params) {
    this.mustArray = [];
    this.sortArray = [];
    this.sourceIncludeSet = constent.abnormal.column;

    this.query = {
      query: {
        bool: {
          must: this.mustArray,
        },
      },
      _source: {
        includes: this.sourceIncludeSet,
        excludes: [],
      },
      sort: this.sortArray,
    };
  }

  async getFeature(featureBase64) {
    var req = {};
    var images = [];
    var image = {};
    image.data = featureBase64;
    images.push(image);
    req.images = images;
    return utlis.getAsync((resolve, reject) => {
      utlis.postData(config.interfaceStFeature, req, function(res) {
        resolve(res);
      });
    });
  }

  async getTrackId(param) {
    return utlis.getAsync((resolve, reject) => {
      utlis.postData(config.tomcatIp + '/manage-ws/feature/compare_people', param, function(res) {
        resolve(res);
      });
    });
  }

  async getTrackIdData(param) {
    var data = await this.getTrackId(param);
    var trackArray = new Array();
    for (let idx in data) {
      trackArray.push(Object.keys(data[idx])[0]);
    }
    return trackArray;
  }

  setESParams(stime, etime, docList) {
    var mustArray = this.mustArray;
    var sortArray = this.sortArray;
    let docIdObj = esUtil.setObj('doc_id', docList);
    let docIdTerm = esUtil.setTerms(docIdObj);
    mustArray.push(docIdTerm);

    let timeObj = esUtil.setTime(stime, etime);
    let timeTerm = esUtil.rangeQuery(timeObj);
    mustArray.push(timeTerm);

    let descSortObj = esUtil.setObj('order', 'desc');
    let sortFrame = esUtil.setObj('frame_timestamp', descSortObj);
    sortArray.push(sortFrame);
  }

  convertTrackData(data) {
    var result = {};
    var images = new Array();
    for (let idx in data) {
      var image = {};
      image = data[idx]._source;
      images.push(image);
    }
    result.images = images;
    result.image_num = data.length;
    return result;
  }

  async getTrackData(stime, etime, docList) {
    var data = await this.getESTrackData(stime, etime, docList);
    return this.convertTrackData(data);
  }

  async getESTrackData(stime, etime, docList) {
    //设置查询参数
    this.setESParams(stime, etime, docList);
    return utlis.getAsync(
      ((resolve, reject) => {
        esClient.search(
          {
            index: config.attributeIndex,
            type: config.attributeType,
            size: 10000,
            body: this.query,
          },
          (error, data) => {
            logger.info('相应结果' + error + data);
            resolve(data.hits.hits);
          }
        );
      }).bind(this)
    );
  }
}
module.exports = TrackService;
