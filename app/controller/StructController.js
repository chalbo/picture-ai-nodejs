const AbnormalService = require('../service/AbnormalService');

class FaceHomeController {
  getRouters() {
    return {
      'POST /api/structured/realtimeWarningTotal': this.realtimeWarningTotal, //"实时预警信息"
      'POST /api/structured/realtimeWarning': this.realtimeWarningTotal, //"获取当日预警信息"
      'POST /api/structured/realtimeSnapshot': this.realtimeWarningTotal, //获取今日抓拍
      'POST /api/structured/mapWaringInfo': this.realtimeWarningTotal, //获取地图预警信息
      'POST /api/structured/attribute': this.realtimeWarningTotal, //结构化信息-属性查询
      'POST /api/structured/attributeImage': this.realtimeWarningTotal, //结构化信息-属性图片查询attributeImage
      'POST /api/structured/track': this.realtimeWarningTotal, //轨迹查询
      'POST /api/structured/historyMonitor': this.realtimeWarningTotal, //落脚点分析
      'POST /api/structured/imagesign': this.realtimeWarningTotal, //结构化信息-帧图画框
    };
  }
  async realtimeWarningTotal(ctx, next) {
    let param = ctx.request.body;
    var attrs = [];
    for (var l in param.attr) {
      attrs.push(l.toString());
    }
    ctx.response.type = 'application/json';
    // var service = new AbnormalService();
    // service.setAbnormalType(attrs);
    // service.setAbnormalTime(param.start_time, param.end_time);
    // var data = await service.getHistoryAbnormal();
    ctx.response.body = data;
  }
}
module.exports = new FaceHomeController().getRouters();
