const fs = require("fs");
const path = require("path");
const { cv, runVideoDetection } = require("./utils");
const logger = require('../../../common/logger');

class Tensorflow {
  constructor(options) {
    const { modelFile, classNamesFile, minConfidence } = options;
    if (!fs.existsSync(modelFile) ||
      !fs.existsSync(classNamesFile)) {
      logger.error('Invalid Tensorflow configuration file');
      console.log("could not find Tensorflow model");
    }
    else {
      this.options = options;
      this.classNames = fs.readFileSync(classNamesFile).toString().split('\n');
      this.net = cv.readNetFromTensorflow(modelFile);

    }

  }
  // 执行视频，缺播放
  runVideo() {
    //webcamPort 0为本机器
    const webcamPort = 0;
    runVideoDetection(webcamPort, this.recImage);
  }

  recImage = (img) => {
    // object detection model works with 300 x 300 images
    const size = new cv.Size(300, 300);
    const vec3 = new cv.Vec(0, 0, 0);

    // network accepts blobs as input
    const inputBlob = cv.blobFromImage(img, 1, size, vec3, true, true);
    this.net.setInput(inputBlob);

    console.time("net.forward");
    // forward pass input through entire network, will return
    // classification result as 1x1xNxM Mat
    const outputBlob = this.net.forward();
    console.timeEnd("net.forward");

    // get height and width from the image
    const [imgHeight, imgWidth] = img.sizes;
    const numRows = outputBlob.sizes.slice(2, 3);

    for (let y = 0; y < numRows; y += 1) {
      const confidence = outputBlob.at([0, 0, y, 2]);
      if (confidence > 0.5) {
        const classId = outputBlob.at([0, 0, y, 1]);
        const className = this.classNames[classId];
        const boxX = imgWidth * outputBlob.at([0, 0, y, 3]);
        const boxY = imgHeight * outputBlob.at([0, 0, y, 4]);
        const boxWidht = imgWidth * outputBlob.at([0, 0, y, 5]);
        const boxHeight = imgHeight * outputBlob.at([0, 0, y, 6]);

        const pt1 = new cv.Point(boxX, boxY);
        const pt2 = new cv.Point(boxWidht, boxHeight);
        const rectColor = new cv.Vec(23, 230, 210);
        const rectThickness = 2;
        const rectLineType = cv.LINE_8;

        // draw the rect for the object
        img.drawRectangle(pt1, pt2, rectColor, rectThickness, rectLineType);

        const text = `${className} ${confidence.toFixed(5)}`;
        const org = new cv.Point(boxX, boxY + 15);
        const fontFace = cv.FONT_HERSHEY_SIMPLEX;
        const fontScale = 0.5;
        const textColor = new cv.Vec(255, 0, 0);
        const thickness = 2;

        // put text on the object
        img.putText(text, org, fontFace, fontScale, textColor, thickness);
      }
    }

    cv.imshow("Temsorflow Object Detection", img);
  };
}



module.exports = { DarkNet };