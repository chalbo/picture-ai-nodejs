const AttributeService = require('../service/AttributeService.js');
const jsonUtil = require('../common/JsonUtils.js');

class Attribute {
  getRouters() {
    return {
      'PUT /res/attribute': this.getAttributeData,
    };
  }
  async getAttributeData(ctx, next) {
    ctx.response.type = 'application/json';
    var params = ctx.request.body;
    if (params == null) {
      throw new Error('请求参数为空！');
    }
    var resultDefault = {
      cameras: [],
      cameras_num: 0,
    };
    var attrs = params.attr;
    var attrsMap = jsonUtil.objToStrMap(attrs);

    if (attrsMap.size <= 1) {
      ctx.response.body = resultDefault;
    } else {
      var service = new AttributeService(params);
      //设置查询参数
      service.setESParams();
      var data = await service.getAttribute();
      ctx.response.body = data;
    }
  }
}
module.exports = new Attribute().getRouters();
