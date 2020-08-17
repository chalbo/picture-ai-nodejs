const moment = require('moment');

const Koa = require('koa');
const staticContents = require('koa-static');
const Koa_Session = require('koa-session'); // 导入koa-session
const path = require('path');
const router2controller = require('./app/router2controller');
const config = require('./config/config.local.js');
const proxy = require('koa-server-http-proxy'); //引入代理模块

const app = new Koa();
const proxyOptions = {
  target: 'http://2.36.94.67/monitor/', //后端服务器地址
  // target: 'http://10.6.6.58:9110/monitor/', //后端服务器地址
  // target: 'http://192.168.1.7:9110/monitor/', //后端服务器地址
  changeOrigin: true, //处理跨域
};

const handler = async (ctx, next) => {
  try {
    await next();
    //throw new Error("1111")
  } catch (error) {
    ctx.status = error.statusCode || error.status || 500;
    ctx.response.body = {
      code: '500',
      message: '服务器异常',
      desc: error.message,
    };
  }
};
app.use(handler);
app.on('error', (err, ctx) => {
  console.log(err);
});
console.log(proxy);
const exampleProxy = proxy('/manageApi', proxyOptions); //api前缀的请求都走代理
app.use(exampleProxy); //注册

// 配置
const session_signed_key = ['some secret hurr']; // 这个是配合signed属性的签名key
const session_config = {
  key: 'token' /**  cookie的key。 (默认是 koa:sess) */,
  maxAge: 4000000 /**  session 过期时间，以毫秒ms为单位计算 。*/,
  autoCommit: true /** 自动提交到响应头。(默认是 true) */,
  overwrite: true /** 是否允许重写 。(默认是 true) */,
  httpOnly: true /** 是否设置HttpOnly，如果在Cookie中设置了"HttpOnly"属性，那么通过程序(JS脚本、Applet等)将无法读取到Cookie信息，这样能有效的防止XSS攻击。  (默认 true) */,
  signed: true /** 是否签名。(默认是 true) */,
  rolling: true /** 是否每次响应时刷新Session的有效期。(默认是 false) */,
  renew: false /** 是否在Session快过期时刷新Session的有效期。(默认是 false) */,
};
// const logger=require("./app/common/logger");

const session = Koa_Session(session_config, app);
app.keys = session_signed_key;
app.use(session);
// 配置静态资源
const staticPath = './static';
app.use(staticContents(path.join(__dirname, staticPath)));

app.use(router2controller());

app.listen(config.port);
console.log(
  `Server started and listen on port ${config.port}。时间：${moment().format(
    'YYYY-MM-DD HH:mm:SS'
  )}`
);
