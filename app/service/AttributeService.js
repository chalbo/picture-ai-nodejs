const esClient = require('../common/ESClient');
const constent = require('../../config/Constent');
const config = require('../../config/config.local');
const utlis = require('../common/utils');
const jsonUtils = require('../common/JsonUtils.js');
const esUtil = require('../common/esUtil.js');
const moment = require('moment');
const logger = require('../common/logger');

class AttributeService {
  constructor(params) {
    this.params = params;
    this.mustArray = [];
    this.shouldArray = [];
    this.sortArray = [];
    this.sourceIncludeSet = constent.abnormal.column;
    this.aggs = {
      camera_aggs: {
        terms: {
          field: 'camera_id',
          size: 3000,
        },
        aggregations: {
          camera_gis: {
            top_hits: {
              size: 1,
              _source: {
                includes: ['camera_gis', 'address'],
                excludes: [],
              },
            },
          },
        },
      },
    };
    this.query = {
      query: {
        bool: {
          must: this.mustArray,
          should: this.shouldArray,
        },
      },
      _source: {
        includes: this.sourceIncludeSet,
        excludes: [],
      },
      sort: this.sortArray,
      aggregations: {},
    };
  }
  setESParams() {
    var paramObj = this.params;
    var paramMap = jsonUtils.objToStrMap(paramObj);

    var attrs = this.params.attr;
    var attrMap = jsonUtils.objToStrMap(attrs);

    var mustArray = this.mustArray;
    var shouldArray = this.shouldArray;
    var sortArray = this.sortArray;
    var sourceIncludeSet = new Set(this.sourceIncludeSet);

    if (attrMap.has('ride')) {
      if (attrMap.get('ride') == '1') {
        attrMap.delete('ride');
        attrMap.set('track_type', '3');
      }
    }

    if (attrMap.has('mv_type')) {
      if (attrMap.get('mv_type') == '1') {
        attrMap.delete('mv_type');
        attrMap.set('track_type', '3');
      }
    }

    for (let item of attrMap.entries()) {
      var key = item[0];
      var value = item[1];
      if (key.includes('_color')) {
        let colorValue = Math.trunc(value);
        if (colorValue != 11) {
          let termObj = esUtil.setObj(key, value);
          let term = esUtil.setTerm(termObj);
          mustArray.push(term);
          sourceIncludeSet.add(key);
        }
      } else if (key.includes('mv_classification') || key.includes('mv_license')) {
        //根据车牌号和车品牌创建模糊搜索
        let word = '*' + value + '*';
        let fields = new Array();
        fields.push(key);
        let queryString = esUtil.queryString(word, fields);
        let wildcardObj = esUtil.setObj(key, word);
        let wildcard = esUtil.wildcardQuery(wildcardObj);
        let shouldArray = new Array();
        shouldArray.push(queryString);
        shouldArray.push(wildcard);
        let should = esUtil.shouldQuery(shouldArray, '1');
        mustArray.push(should);
        sourceIncludeSet.add(key);
      } else if (key.includes('mv_type')) {
        let mv_typeValue = Math.trunc(value);
        if (mv_typeValue != 999) {
          let mv_typeObj = esUtil.setObj(key, mv_typeValue);
          let mv_typeTerm = esUtil.setTerm(mv_typeObj);
          let mv_typeMust = esUtil.mustQuery(mv_typeTerm);
          mustArray.push(mv_typeMust);
          sourceIncludeSet.add(key);
        }
      } else if (key.includes('people')) {
        let peopleValue = Math.trunc(value);
        if (peopleValue == 1) {
          let peopleObj = esUtil.setObj('people_ok', peopleValue);
          let peopleTerm = esUtil.setTerm(peopleObj);
          shouldArray.push(peopleTerm);
        }
      } else if (key.includes('face')) {
        let faceValue = Math.trunc(value);
        if (faceValue == 1) {
          let faceObj = esUtil.setObj('face_ok', faceValue);
          let faceTerm = esUtil.setTerm(faceObj);
          shouldArray.push(faceTerm);
        }
      } else if (key.includes('car')) {
        let carValue = Math.trunc(value);
        if (carValue == 1) {
          let carObj = esUtil.setObj('car_ok', carValue);
          let carTerm = esUtil.setTerm(carObj);
          shouldArray.push(carTerm);
        }
      } else if (key.includes('carNo')) {
        let carNoValue = Math.trunc(value);
        if (carNoValue == 1) {
          let carNoObj = esUtil.setObj('car_no_ok', carNoValue);
          let carNoTerm = esUtil.setTerm(carNoObj);
          shouldArray.push(carNoTerm);
        }
      } else {
        let paramValue = Math.trunc(value);
        let paramObj = esUtil.setObj(key, paramValue);
        let paramTerm = esUtil.setTerm(paramObj);
        mustArray.push(paramTerm);
        sourceIncludeSet.add(key);
      }
    }

    if (paramMap.has('gis_top_left') && paramMap.has('gis_bottom_right')) {
      let gis_top_left = paramMap.get('gis_top_left');
      let gis_bottom_right = paramMap.get('gis_bottom_right');
      let camera_gis = esUtil.setCarmeraGis(gis_top_left, gis_bottom_right);
      let geoboxQuery = esUtil.geoboxQuery(camera_gis);
      mustArray.push(geoboxQuery);
    }

    if (paramMap.has('start_time') && paramMap.has('end_time')) {
      let start_time = moment(paramMap.get('start_time')).format('X');
      let end_time = moment(paramMap.get('end_time')).format('X');
      let timeObj = esUtil.setTime(start_time, end_time);
      let rangeQuery = esUtil.rangeQuery(timeObj);
      mustArray.push(rangeQuery);
    }

    if (paramMap.has('camera_ids')) {
      let camera_ids = paramMap.get('camera_ids');
      let cameraArray = jsonUtils.objToArray(camera_ids);
      let cameraArrayObj = esUtil.setCamArrayObj(cameraArray);
      let cameraArrayTerm = esUtil.setTerm(cameraArrayObj);
      mustArray.push(cameraArrayTerm);
    }

    if (paramMap.has('camera_id')) {
      //添加摄像头过滤
      let camera_id = paramMap.get('camera_id');
      let cameraObj = esUtil.setObj('camera_id', camera_id);
      let cameraTerm = esUtil.setTerm(cameraObj);
      mustArray.push(cameraTerm);
      //按照时间降序
      let timeStamp = esUtil.setObj('order', 'desc');
      let timeStampObj = esUtil.setObj('frame_timestamp', timeStamp);
      sortArray.push(timeStampObj);
      // this.query["query"] = {"size" : 5000};
    } else {
      //聚类查询
      this.query.aggregations = this.aggs;
    }
  }

  //封装属性数据
  convertAttributeData(data) {
    var result = {};

    var buckets = data.aggregations.camera_aggs.buckets;
    result.camera_num = buckets.length;
    //创建字典过滤cameraId
    var cameraIds = {};
    var cameras = [];
    for (let idx in buckets) {
      var bucket = buckets[idx];
      var hits = bucket.camera_gis.hits;
      var source = hits.hits[0]._source;
      if (!cameraIds[bucket.key]) {
        cameraIds[bucket.key] = bucket.key;
        var camera = {};
        camera.camera_id = bucket.key;
        camera.image_num = hits.total;
        camera.camera_gis = source.camera_gis;
        camera.address = source.address;
        camera.frame_timestamp = moment(source.frame_timestamp).format('YYYY-MM-DD HH:mm:ss');
        cameras.push(camera);
      }
    }
    result.cameras = cameras;
    return result;
  }

  convertAttributeHistoryData(data) {
    var result = {};
    var hits = data.hits;
    result.image_num = hits.total;
    var hitsArray = data.hits.hits;
    var images = new Array();
    for (let idx in hitsArray) {
      var image = hitsArray[idx]._source;
      image.frame_timestamp = moment(image.frame_timestamp * 1000).format('YYYY-MM-DD HH:mm:ss');
      images.push(image);
    }

    result.images = images;
    return result;
  }
  setESDocListParams() {
    var docquery = {
      bool: {
        should: [],
      },
    };
    var params = this.params;
    for (let idx in params) {
      var doctmp = {
        match: {
          doc_id: {
            query: '',
            type: 'phrase',
          },
        },
      };
      doctmp.match.doc_id.query = params[idx];
      docquery.bool.should.push(doctmp);
    }
    this.query.query.bool.must = docquery;
  }
  async getAttribute() {
    var data = await this.getESAttribute();
    if (data.aggregations != undefined) {
      return this.convertAttributeData(data);
    } else {
      return this.convertAttributeHistoryData(data);
    }
  }

  async getESAttribute() {
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
            resolve(data);
          }
        );
      }).bind(this)
    );
  }
}
module.exports = AttributeService;
