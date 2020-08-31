const ffmpegCommand = require('fluent-ffmpeg');

//his视频播放
//对视频分片加密
ffmpegCommand(fileName)
  .addOption('-hls_time', '10') //设置每个片段的长度
  .addOption('-hls_key_info_file', keyInfoPath) //keyInfoPath为密匙
  .addOption('-hls_list_size', '0')
  .addOption('-threads', '4')
  .save(playList) //playList为保存m3u8索引文件的地址,例如xxx/playlist.m3u8
  .on('end', () => {
    //分片结束时回调
    console.log('分片加密完成');
  })
  .on('stderr', function(stderrLine) {
    //在分片加密时的回调
    logger.debug('Stderr output: ' + stderrLine);
  })
  .on('error', function(err) {
    //发生错误的回调
  });

//获取视频的长度
ffmpegCommand.ffprobe(fileName, async function(e, d) {
  //返回的函数d是个对象,里面有steam属性,steam属性是个数组
  //这里罗列几个比较重要的值,其他的值可以自己去github官方文档上看
  steam[0].codec_name; //编码格式
  steam[0].duration; //视频的时长,单位为秒
  steam[0].width; //视频宽度
  steam[0].height; //视频高度
});

//生成视频缩略图,对视频里面的每一秒进行截图
ffmpegCommand(fileName)
  .on('filenames', function(filenames) {
    //filenames为截图保存的图片名,格式在保存的时候定义
    console.log('Will generate ' + filenames.join(', '));
  })
  .on('end', function() {})
  .screenshots({
    //生成多少张图
    count: 4,
    //在指定时间位置生成图片,我这里指定的是在1秒2秒3秒的位置截3张图
    timemarks: [1, 2, 3], //参数是个数组
    //图片保存位置
    folder: 'save path for folder',
    //保存图片的名字格式 imgname_1
    filename: '%b_%i',
    size: `${width}x${height}`,
  });

const ffmpeg = require('service/fluent-ffmpeg');
var fs = require('fs');
var path = require('path');
var vname = '6619626578831740000';
var input = './input';
var output = './output';
var middle = './middle';
// 用 endingH 生成 endingW 视频
// ffmpeg(path.join(__dirname, middle, `endingH.mp4`))
// .size('960x540').autopad('black')
// .on('error', function (err) {
//     console.log('生成endingW视频发生错误: ' + err.message);
// }).on('end', function () {
//     console.log('生成endingW视频成功');
// }).save(path.join(__dirname, middle, `endingW.mp4`));
new Promise(resolve => {
  ffmpeg(path.join(__dirname, input, `${vname}.mp4`)).ffprobe(0, function(err, metadata) {
    !!err && console.log('无法读取视频大小:' + err.message);
    var endName = metadata.streams[0].height > 600 ? 'endingH' : 'endingW';
    var out = fs.createWriteStream(path.join(__dirname, middle, 'input.txt'), 'utf8');
    out.write(
      `file '${path.join(__dirname, input, vname)}.mp4'\nfile '${path.join(
        __dirname,
        middle,
        endName
      )}.mp4'`
    );
    out.end;
    out.on('ready', function() {
      console.log('创建文本成功');
      resolve();
    });
  });
})
  .then(() => {
    return new Promise(resolve => {
      ffmpeg(path.join(__dirname, middle, 'input.txt'))
        .inputOptions('-f', 'concat', '-safe', '0')
        .on('error', function(err) {
          console.log('合并视频发生错误: ' + err.message);
        })
        .on('end', function() {
          console.log('合并视频成功');
          resolve();
        })
        .save(path.join(__dirname, middle, 'first.mp4'));
    });
  })
  .then(() => {
    return new Promise(resolve => {
      ffmpeg(path.join(__dirname, middle, 'first.mp4'))
        .input(path.join(__dirname, middle, 'logo.png'))
        .inputOptions('-filter_complex', 'overlay=10:10')
        .on('error', function(err) {
          console.log('水印添加错误: ' + err.message);
        })
        .on('end', function() {
          console.log('水印添加成功');
          resolve();
        })
        .save(path.join(__dirname, middle, 'second.mp4'));
    });
  })
  .then(() => {
    return new Promise(resolve => {
      ffmpeg(path.join(__dirname, middle, 'second.mp4'))
        .videoFilters(
          "drawtext=fontfile=simhei.ttf:text='tttttTTT':x=100:y=10:fontsize=24:fontcolor=yellow:shadowy=2"
        )
        .on('error', function(err) {
          console.log('文字水印添加错误: ' + err.message);
        })
        .on('end', function() {
          console.log('文字水印添加成功');
          resolve();
        })
        .save(path.join(__dirname, output, `${vname}.mp4`));
    });
  })
  .then(() => {
    console.log(path.join(__dirname, output, `${vname}.mp4`));
  }); //
