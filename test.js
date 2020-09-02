const path = require("path");
const cv = require('opencv4nodejs');
const { darkNet } = require('./app/distributed/openCv/code/darkNet');
// loadModel()
const darknetPath = "/app/distributed/openCv/data/struct/Flag_Recon/";
const cfgFile = path.join(__dirname, darknetPath + "Project_Obj365_test.cfg");
const weightsFile = path.join(__dirname, darknetPath + "Project_Obj365_170000.weights");
const labelsFile = path.join(__dirname, darknetPath + "Project_Obj365.names");

const imageUrl = '/app/distributed/openCv/data/struct/images/444.jpeg';
const img = cv.imread(path.join(__dirname, imageUrl));
const dn = new darkNet({ cfgFile, weightsFile, labelsFile, minConfidence: 0.5, nmsThreshold: 0.3 });
cv.imshowWait("Darknet YOLO Object Detection", dn.recImage(img));