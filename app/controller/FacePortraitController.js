const AbnormalService = require('../service/AbnormalService');

class FaceHomeController {
  getRouters() {
    return {
      'POST /api/portrait/historyMonitorInfo': this.realtimeWarningTotal, //"历史预警查询"
      'POST /api/portrait/identitycard': this.realtimeWarningTotal, //"身份证查底库照片"
      'POST /api/portrait/pedestriansInfo': this.realtimeWarningTotal, //抓拍历史查询/动态以图搜图
      'POST /api/portrait/track': this.realtimeWarningTotal, //轨迹搜索查询
      'POST /api/portrait/comparison': this.realtimeWarningTotal, //人像比对(图图比对)
      'POST /api/portrait/personnelInfo': this.realtimeWarningTotal, //静态以图搜图 路人
      'POST /api/portrait/footholdAnalysis': this.realtimeWarningTotal, //落脚点分析
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
