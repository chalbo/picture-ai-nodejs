const path = require('path');
const cv = require('opencv4nodejs');

const image = cv.imread(path.resolve(__dirname, '../data/Lenna.png'));

const dst = image.guidedFilter(image, 10, 500, -1);

cv.imshowWait("dst", dst);