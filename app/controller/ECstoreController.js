const moment = require('moment');
const fs = require('fs');
const ECstoreService = require('../service/ECstoreService');
class ECstore {
  getRouters() {
    return {
      'GET /res/ECstore/': this.getTrackImageData,
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
}
module.exports = new ECstore().getRouters();
