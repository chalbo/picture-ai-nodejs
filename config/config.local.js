module.exports = {
  port: 8001,
  isDebuger: true,
  //esconfig
  esHost: '127.0.0.1:9200',
  esBusinessConfig: [
    {
      index: 'attribute',
      type: 'history',
      data: {},
      redisDataType: { queueOut: 'queue_struct', queueIn: 'input_in' },
    },
    {
      index: 'abnormal',
      type: 'history',
      data: {},
      redisDataType: { queueOut: 'queue_struct', queueIn: 'input_in' },
    },
  ],
  redis: {
    host: '10.0.37.172',
    port: 6379,
    passwd: '',
    opt: {},
  },
  database: { host: 'localhost', user: 'xjcs', password: 'xjcs', port: 3306, database: `monitor` },
};
