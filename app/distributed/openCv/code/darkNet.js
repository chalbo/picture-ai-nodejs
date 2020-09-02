const fs = require("fs");
const path = require("path");
const cv = require('opencv4nodejs');
const logger = require('../../../common/logger');

class DarkNet {
  constructor(options) {
    const { cfgFile, weightsFile, labelsFile, minConfidence, nmsThreshold } = options;
    if (!fs.existsSync(weightsFile) ||
      !fs.existsSync(cfgFile) ||
      !fs.existsSync(labelsFile)) {
      logger.error('Invalid darkNet configuration file');
      console.log("could not find darknet model");

    }
    else {
      this.options = options;
      this.labels = fs
        .readFileSync(labelsFile)
        .toString()
        .split("\n");
      this.net = cv.readNetFromDarknet(cfgFile, weightsFile);
      this.allLayerNames = this.net.getLayerNames();
      this.unconnectedOutLayers = this.net.getUnconnectedOutLayers();
      this.layerNames = this.unconnectedOutLayers.map(layerIndex => {
        return this.allLayerNames[layerIndex - 1];
      });

    }

  }

  recImage = (img) => {
    const { net, allLayerNames, unconnectedOutLayers, layerNames } = this;
    const { minConfidence, nmsThreshold } = this.options;
    // object detection model works with 416 x 416 images
    const size = new cv.Size(416, 416);
    const vec3 = new cv.Vec(0, 0, 0);
    const [imgHeight, imgWidth] = img.sizes;

    // network accepts blobs as input
    const inputBlob = cv.blobFromImage(img, 1 / 255.0, size, vec3, true, false);
    net.setInput(inputBlob);

    console.time("net.forward");
    // forward pass input through entire network
    const layerOutputs = net.forward(layerNames);
    console.timeEnd("net.forward");

    let boxes = [];
    let confidences = [];
    let classIDs = [];

    layerOutputs.forEach(mat => {
      const output = mat.getDataAsArray();
      output.forEach(detection => {
        const scores = detection.slice(5);
        const classId = scores.indexOf(Math.max(...scores));
        const confidence = scores[classId];

        if (confidence > minConfidence) {
          const box = detection.slice(0, 4);

          const centerX = parseInt(box[0] * imgWidth);
          const centerY = parseInt(box[1] * imgHeight);
          const width = parseInt(box[2] * imgWidth);
          const height = parseInt(box[3] * imgHeight);

          const x = parseInt(centerX - width / 2);
          const y = parseInt(centerY - height / 2);

          boxes.push(new cv.Rect(x, y, width, height));
          confidences.push(confidence);
          classIDs.push(classId);

          const indices = cv.NMSBoxes(
            boxes,
            confidences,
            minConfidence,
            nmsThreshold
          );

          indices.forEach(i => {
            const rect = boxes[i];

            const pt1 = new cv.Point(rect.x, rect.y);
            const pt2 = new cv.Point(rect.x + rect.width, rect.y + rect.height);
            const rectColor = new cv.Vec(255, 0, 0);
            const rectThickness = 2;
            const rectLineType = cv.LINE_8;

            // draw the rect for the object
            img.drawRectangle(pt1, pt2, rectColor, rectThickness, rectLineType);

            const text = this.labels[classIDs[i]];
            const org = new cv.Point(rect.x, rect.y + 15);
            const fontFace = cv.FONT_HERSHEY_SIMPLEX;
            const fontScale = 0.5;
            const textColor = new cv.Vec(123, 123, 255);
            const thickness = 2;

            // put text on the object
            img.putText(text, org, fontFace, fontScale, textColor, thickness);
          });
        }
      });
    });
    return img;
    // cv.imshowWait("Darknet YOLO Object Detection", img);
  }
}



module.exports = { DarkNet };