const path = require('path');
const cv = require('opencv4nodejs');

const image = cv.imread(path.resolve(__dirname, '../data/Lenna.png'));

const processedImage = cv.applyColorMap(image, cv.COLORMAP_AUTUMN);

cv.imshowWait("applyColorMap", processedImage);
