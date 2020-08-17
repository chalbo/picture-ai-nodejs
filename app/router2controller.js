const fs = require('fs');
const router = require('koa-router')();
const koaBody = require('koa-body');
const logger = require('./common/logger');
const config = require('../config/config.local.js');
const { baseUrl } = require('../sysConfig.json');

function addMapping(router, mapping) {
  var path = '';
  for (var url in mapping) {
    if (url.startsWith('GET ')) {
      path = url.substring(4);
      router.get(baseUrl + path, koaBody(), mapping[url]);
      console.log(`register URL mapping: GET ${baseUrl + path}`);
    } else if (url.startsWith('POST ')) {
      path = url.substring(5);
      router.post(baseUrl + path, koaBody({ multipart: true }), mapping[url]);
      console.log(`register URL mapping: POST ${baseUrl + path}`);
    } else if (url.startsWith('PUT ')) {
      path = url.substring(4);
      router.put(baseUrl + path, koaBody({ multipart: true }), mapping[url]);
      console.log(`register URL mapping: PUT ${baseUrl + path}`);
    } else if (url.startsWith('DELETE ')) {
      path = url.substring(7);
      router.del(baseUrl + path, koaBody(), mapping[url]);
      console.log(`register URL mapping: DELETE ${baseUrl + path}`);
    } else {
      console.log(`invalid URL: ${url}`);
    }
  }
}

function addControllers(router, dir) {
  try {
    fs.readdirSync(__dirname + '/' + dir)
      .filter(f => {
        return f.endsWith('.js');
      })
      .forEach(f => {
        console.log(`process controller: ${f}...`);
        let mapping = require(__dirname + '/' + dir + '/' + f);
        addMapping(router, mapping);
      });
  } catch (e) {
    if (!config.isDebuger) {
      logger.error(e);
    } else {
      throw e;
    }
  }
}

/**
 * 返回当前集合中指定所有路由集合
 * @method
 * @param {dir} dir:指定controller位置
 * @return {router.routes()}  koa use相关键值对
 */
module.exports = function (dir) {
  var controllersDir = dir || 'controller';
  addControllers(router, controllersDir);
  return router.routes();
};
