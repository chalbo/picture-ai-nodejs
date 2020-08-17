const moment = require('moment');

const config = require('./config/config.local.js');
const logger = require('./app/common/logger');
const { startLpAndSave } = require('./service/EsStructuredWrite.js');

//测试输入图片
const redis = require('redis');
const fs = require('fs');
let bitmap = fs.readFileSync(__dirname + '/service/images/thumbnail-at-seconds.png');

let base64str = Buffer.from(bitmap, 'binary').toString('base64'); // base64编码
const gSdkRedis = redis.createClient(6379, '10.0.37.172');
function getIn() {
  var queue_in = 'input_in'; //   #接受请求的redis队列,
  // var parm = {
  //   "image": base64str,// #请求检测的图片(base64编码)
  //   "frameid": "10000002_10000002",    //    #请求图片ID
  //   "url": "10000002",
  //   "inference_model": ["PersonVehicle"],  //    #请求结构化检测
  //   "include": ["box", "struct", "feature"],
  //   "exclude": ["image", "stat_fields"],     //     #禁止返回内容
  // }
  //var parm = { "inference_model": ["PersonVehicle"], "exclude": ["image", "stat_fields"], "url": "1", "frameid": "1_1234567890111", "image": "" }
  //gSdkRedis.rpush(queue_in, JSON.stringify(parm));
  // console.log('start rpush redis, response:')
  //setTimeout(() => { getIn() }, 2000)

  var parm = {
    inference_model: ['PersonVehicle'],
    exclude: ['object_image', 'stat_fields'],
    url: '4',
    frameid: '4_1234567890111',
    image: base64str,
  };
  gSdkRedis.rpush('input_in', JSON.stringify(parm));
  console.log('start rpush redis, response:');
  // gSdkRedis.lpop('queue_struct', function (err, data) {
  //   if (!err && data) {
  //     console.log(data);
  //   }
  // });
}
getIn();

setInterval(() => {
  getIn();
}, 5000);

//开启获取redis信息倒入到结构化系统
try {
  startLpAndSave();
} catch (e) {
  logger.error(e);
  startLpAndSave();
}
