const logger = require('../app/common/logger');
const { getAsync } = require('../app/common/utils.js');
const esClinet = require('../app/common/ESclient');
const config = require('../config/config.local.js');

class EsDataDb {
  static EsDataDb_handel = new EsDataDb();

  constructor() {}
  iniEsDb() {
    const esDblist = config.esBusinessConfig;
    esDblist.map(val => {
      this.insertUpdateEsDb(val.index, val.type, val.data);
    });
  }

  async insertUpdateEsDb(index, type, data) {
    // const exists = await client.exists({
    //   index: index,
    //   type: type,
    //   id: 1
    // });
    // if (!exists) {
    await esClinet.index({
      index: index,
      type: type,
      body: data,
    });
    //}
  }

  async search(index, type, query) {
    return utlis.getAsync(
      ((resolve, reject) => {
        esClinet.search(
          {
            index,
            type,
            body: query,
          },
          (error, data) => {
            if (error) {
              reject(error);
            }
            resolve(data);
          }
        );
      }).bind(this)
    );
  }
}

module.exports = EsDataDb;
