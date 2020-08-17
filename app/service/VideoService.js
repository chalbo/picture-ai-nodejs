const esClient = require('../common/ESClient.js');
const constent = require('../../config/Constent.js');
const config = require('../../config/config.local');
const utlis = require('../common/utils');
const jsonUtils = require('../common/JsonUtils.js');
const moment = require('moment');
const esUtil = require('../common/esUtil.js');
const logger = require('../common/logger');
const ffmpeg = require('fluent-ffmpeg');
const NodeMediaServer = require('node-media-server');
const fs = require('fs');
// const walk = require('walk')

class VideoService {
  constructor({ cameraId, url }) {
    let fileDicName = cameraId;
    let cameraFile = `${process.cwd()}/video/${fileDicName}`;
    fs.exists(cameraFile, function(exists) {
      if (!exists) {
        fs.mkdir(cameraFile);
      }
    });
    this.cameraId = cameraId;
    this.url = url;
    this.cameraFile = cameraFile;
    this.videoLength = 20;
    this.ffmpegCmd = null;
    this.rtmpRuning = false;
  }

  startConvertRtmpFfmpeg() {
    // rtmp 播放 服务器
    const config = {
      rtmp: {
        port: 1935,
        chunk_size: 60000,
        gop_cache: true,
        ping: 60,
        ping_timeout: 30,
      },
      http: {
        port: 8001,
        allow_origin: '*',
      },
    };

    var nms = new NodeMediaServer(config);
    nms.run();
    // 转码指令
    this.ffmpegCmd = ffmpeg('rtsp://admin:Pass1234@10.6.3.235')
      .inputOptions(['-rtsp_transport', 'tcp'])
      .outputOptions([
        '-fflags',
        'nobuffer',
        '-vcodec',
        'libx264',
        '-preset',
        'superfast',
        '-rtsp_transport',
        'tcp',
        '-threads',
        '2',
        // '-f',
        // 'flv',
        '-r',
        '25',
        // '-s',
        // '640x480',
        //'1280x720',
        '-an',
      ])
      .inputFPS(25)
      .noAudio()
      .size('640x?')
      .aspect('4:3')
      .format('flv')
      // 此处的 /live/camera, camera类似于一个房间的概念, 你可以设置为你想要的名字
      .save(`rtmp://localhost:1935/live/livestream`)
      .on('start', function(e) {
        this.rtmpRuning = true;
        console.log('stream is start: ' + e);
      })
      .on('end', function() {
        this.rtmpRuning = false;
        console.log('ffmpeg is end');
      })
      .on('error', function(err) {
        this.rtmpRuning = true;
        console.log('ffmpeg is error! ' + err);
        //command.kill()
        //reloadStream(uri)
      });
  }

  startConvertFfmpeg() {
    try {
      let filem3u8 = `${this.cameraFile}/${this.cameraId}.m3u8`;
      this.ffmpegCmd = ffmpeg(this.url)
        .inputOptions([
          '-fflags flush_packets -max_delay 2 -flags -global_header -hls_time 2 -hls_list_size 3 -vcodec copy --y ',
          filem3u8,
        ])
        .on('error', function(err) {
          logger.error('An error occurred: ' + err.message);
        })
        .start();
      return true;
    } catch (e) {
      logger.error(e.message);
      return false;
    }
  }
  async stopConvertFfmpeg() {
    this.ffmpegCmd.kill();
  }
  async deleteFfmpegFile() {
    let fileDicName = this.cameraId;
    let cameraFile = `${process.cwd()}/video/${fileDicName}`;
    return utlis.getAsync(
      ((resolve, reject) => {
        fs.exists(
          cameraFile,
          function(exists) {
            if (exists) {
              fs.rmdir(cameraFile, function(err) {
                if (err) {
                  resolve({ error: err, status: false });
                } else {
                  resolve({ message: 'ok', status: true });
                }
              });
            }
          }.bind(this)
        );
      }).bind(this)
    );
  }
}
module.exports = VideoService;
