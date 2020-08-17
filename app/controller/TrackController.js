const TrackService = require('../service/TrackService');
const moment = require('moment');
const fs = require('fs');
const AttributeService = require('../service/AttributeService');
class Track {
  getRouters() {
    return {
      // 'PUT /res/track/image': this.getTrackImageData,
      'PUT /res/track/': this.getTrackData,
    };
  }
  async getTrackImageData(ctx, next) {
    let param = ctx.request.body;
    var attrs = [];
    for (var l in param.attr) {
      attrs.push(l.toString());
    }
    ctx.response.type = 'application/json';
    ctx.response.body = {};
  }

  async getTrackData(ctx, next) {
    //返回结果
    var result = {};
    let param = ctx.request.body;
    var searchInfo = JSON.parse(param.searchInfo);
    var file = ctx.request.files.image;
    const reader = fs.readFileSync(file.path);
    //解析图片解析相关base64
    var requestJson = {};
    var stime = moment(searchInfo.start_time).format('X');
    var etime = moment(searchInfo.end_time).format('X');
    var featureBase64 = new Buffer(reader).toString('base64');
    requestJson.stime = Number(stime);
    requestJson.etime = Number(etime);

    ctx.response.type = 'application/json';
    var trackService = new TrackService();
    var feature = await trackService.getFeature(featureBase64);
    var imageFeature = feature.results[0].feature;

    requestJson.featureBase64 = imageFeature;
    var docList = await trackService.getTrackIdData(requestJson);
    if (docList.length == 0) {
      result.image_num = 0;
      result.images = [];
      ctx.response.body = result;
    } else {
      var attributeService = new AttributeService(docList);
      attributeService.setESDocListParams();
      var data = await attributeService.getAttribute();
      ctx.response.body = data;
    }
  }
}
module.exports = new Track().getRouters();
