const fs = require("fs");
const path = require("path");
const { cv, runVideoDetection } = require("./utils");
const logger = require('../../../common/logger');

class Caffe {
  constructor(options) {
    const { prototxt, modelFile, minConfidence, nmsThreshold } = options;
    if (!fs.existsSync(prototxt) ||
      !fs.existsSync(modelFile)) {
      logger.error('Invalid darkNet configuration file');
      console.log("could not find darknet model");

    }
    else {
      this.options = options;
      this.labels = fs
        .readFileSync(labelsFile)
        .toString()
        .split("\n");
      this.net = cv.readNetFromCaffe(prototxt, modelFile);
    }
  }
  // 执行视频，缺播放
  runVideo(url) {
    //webcamPort 0为本机器
    if (!url) {
      url = 0;//本级摄像头
    }
    runVideoDetection(url, this.recImage);
  }

  extractResults = (outputBlob, imgDimensions) => {
    return Array(outputBlob.rows).fill(0)
      .map((res, i) => {
        const classLabel = outputBlob.at(i, 1);
        const confidence = outputBlob.at(i, 2);
        const bottomLeft = new cv.Point(
          outputBlob.at(i, 3) * imgDimensions.cols,
          outputBlob.at(i, 6) * imgDimensions.rows
        );
        const topRight = new cv.Point(
          outputBlob.at(i, 5) * imgDimensions.cols,
          outputBlob.at(i, 4) * imgDimensions.rows
        );
        const rect = new cv.Rect(
          bottomLeft.x,
          topRight.y,
          topRight.x - bottomLeft.x,
          bottomLeft.y - topRight.y
        );

        return ({
          classLabel,
          confidence,
          rect
        });
      });
  };


  recImage = (img) => {
    const [imgHeight, imgWidth] = img.sizes;
    //const imgResized = img.resize(300, 300);

    // network accepts blobs as input
    const inputBlob = cv.blobFromImage(imgResized);
    this.net.setInput(inputBlob);

    // forward pass input through entire network, will return
    // classification result as 1x1xNxM Mat
    let outputBlob = this.net.forward();
    // extract NxM Mat
    outputBlob = outputBlob.flattenFloat(outputBlob.sizes[2], outputBlob.sizes[3]);

    const resultList = extractResults(outputBlob, img)
      .map(r => Object.assign({}, r, { className: classNames[r.classLabel] }));

    const predictions = resultList.filter(res => res.confidence > this.minConfidence);
    cv.imshow("Darknet YOLO Object Detection", img);
  }
}



module.exports = { Caffe };