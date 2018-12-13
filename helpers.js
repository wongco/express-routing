const fs = require('fs');

const OUTPUT_FILE = 'result.txt';

/** get the Mean of the numbers in numberArr */
function getMean(numberArr) {
  const total =
    numberArr.reduce((total, num) => {
      return total + num;
    }, 0) / numberArr.length;
  return `The mean of ${numberArr} is ${total}.\n`;
}

/** get the median of the numbers in numberArr */
function getMedian(numberArr) {
  let result;
  // midPoint for odd length arr or high midpoint for even length arr
  let midPoint = Math.floor(numberArr.length / 2);

  // logic to check if even
  if (numberArr.length % 2 === 0) {
    result = (numberArr[midPoint] + numberArr[midPoint - 1]) / 2;
  } else {
    result = numberArr[midPoint];
  }
  return `The median of ${numberArr} is ${result}.\n`;
}

/** get the Mode of the numbers in numberArr */
function getMode(numberArr) {
  const numberCountObj = {};
  numberArr.forEach(number => {
    numberCountObj[number] = (numberCountObj[number] || 0) + 1;
  });

  let maxCount = 0;
  let bestKey = 0;
  for (let key in numberCountObj) {
    if (numberCountObj[key] > maxCount) {
      maxCount = numberCountObj[key];
      bestKey = key;
    }
  }
  return `The mode of ${numberArr} is ${bestKey}\n`;
}

function writeToFile(output) {
  fs.appendFile(OUTPUT_FILE, output, err => {
    if (err) {
      console.error(err, 'oh noes');
      process.exit(1);
    }
    console.log('Request written!');
  });
}

module.exports = {
  getMean,
  getMedian,
  getMode,
  writeToFile,
  OUTPUT_FILE
};
