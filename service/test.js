const ffmpeg = require('fluent-ffmpeg');

//var ffmpegCmd = ffmpeg('rtmp://localhost:1935/live/livestream');
function test() {
  // this.ffmpegCmd = ffmpeg(__dirname + '/person.mp4');

  // 此处的 /live/camera, camera类似于一个房间的概念, 你可以设置为你想要的名字
  // .ffprobe(function (err, metadata) {
  //   console.log(metadata.length);
  //   !!err && console.log('无法读取视频大小:' + err.message);
  //   var endName = metadata.streams[0].height > 600 ? 'endingH' : 'endingW';
  //   var out = fs.createWriteStream(path.join(__dirname, middle, 'input.txt'), 'utf8');
  //   out.write(`file '${path.join(__dirname, input, vname)}.mp4'\nfile '${path.join(__dirname, middle, endName)}.mp4'`)
  //   out.end;
  //   out.on('ready', function () {
  //     console.log('创建文本成功');
  //     resolve();
  //   });
  // }).run()
  var ffmpegCmd = ffmpeg(__dirname + '/person.mp4');
  ffmpegCmd
    .output(__dirname + '/images/screenshot%d.png')
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
    })
    .run();
}

function test2() {
  var ffmpegCmd = ffmpeg(__dirname + '/person.mp4');
  // var ffmpegCmd = ffmpeg('rtmp://localhost:1935/live/livestream');
  ffmpegCmd.outputOptions(['-f', 'image2', '-ss', '0', '-vframes', '1']).screenshots({
    count: 1,
    filename: 'thumbnail-at-seconds.png',
    folder: __dirname + '/images',
  });
}
test2();
