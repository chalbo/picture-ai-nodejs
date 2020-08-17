const AbnormalService = require('../service/AbnormalService');

class FaceHomeController {
  getRouters() {
    return {
      'GET /api/realtimeWarningTotal': this.realtimeWarningTotal, //首页今日预警和今日抓拍个数
      'GET /api/realtimeWarning': this.realtimeWarning, //今日前10预警
      'GET /api/realtimeSnapshot': this.realtimeWarningTotal, //今日前100人脸
      'GET /api/configData': this.realtimeWarningTotal, //前端配置
      'GET /api/notices': this.realtimeWarningTotal, //通知
      'GET /api/getMenuTree': this.realtimeWarningTotal, // 获取菜单
    };
  }
  async realtimeWarningTotal() {
    ctx.response.type = 'application/json';
    // do nothing
    ctx.response.body = data;
  }

  async realtimeWarning(ctx, next) {
    ctx.response.type = 'application/json';
    // do something
    ctx.response.body = data;
  }
}
module.exports = new FaceHomeController().getRouters();
