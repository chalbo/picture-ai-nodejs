const ffmpeg = require('fluent-ffmpeg');
const NodeMediaServer = require('node-media-server');
const fs = require('fs');

function startConvertRtmpFfmpeg() {
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
  //  this.ffmpegCmd = ffmpeg('rtsp://admin:Pass1234@10.6.3.235')
  //this.ffmpegCmd = ffmpeg(__dirname + '/images/screenshot%d.png')
  this.ffmpegCmd = ffmpeg(__dirname + '/person.mp4')
    // .inputOptions(['-rtsp_transport', 'tcp'])
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
startConvertRtmpFfmpeg();
this.ffmpegCmd.screenshots({
  count: 1,
  filename: 'thumbnail-at-seconds.png',
  folder: __dirname + '/images',
});
