const fs = require('fs');
const express = require('express');

const app = express();
const OUTPUT_FILE = 'result.txt';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/** show results of previous quries */
app.get('/results', (req, res, next) => {
  // checks if file exists
  if (!fs.existsSync(OUTPUT_FILE)) {
    let error = new Error('<div><b>There are no results yet.</b></div>');
    error.status = 404;
    return next(error);
  }

  fs.readFile(OUTPUT_FILE, 'utf8', (error, data) => {
    if (error) {
      error.status = 404;
      error.message =
        '<div><b>There are problems reading previous results.</b></div>';
      return next(error);
    }
    return res.send(data);
  });
});

app.delete('/results', (req, res, next) => {
  fs.unlink(OUTPUT_FILE, error => {
    if (error) {
      error.status = 404;
      error.message = 'There are no results yet.';
      return next(error);
    }
    return res.send('<div><b>All prior results have been cleared.</b></div>');
  });
});

/** middleware to check if nums was passed */
app.use((req, res, next) => {
  // check nums even exits
  if (!req.query.nums) {
    const error = new Error('<div><b>nums are required.</b></div>');
    error.status = 404;
    return next(error);
  }
  return next();
});

/** middleware to check if all num args have valid inputs */
app.use((req, res, next) => {
  // check  all items in nums is legit
  const inputsArr = req.query.nums.split(',');

  const badNums = [];
  for (let i = 0; i < inputsArr.length; i++) {
    if (Number.isNaN(Number(inputsArr[i]))) {
      badNums.push(`<div><b>${inputsArr[i]} is not a number.</b></div>\n`);
    }
  }

  if (badNums.length > 0) {
    const error = new Error(`${badNums.join('')}`);
    error.status = 400;
    return next(error);
  }
  return next();
});

app.get('/mean', (req, res, next) => {
  const numberArr = req.query.nums.split(',').map(Number);
  const saveStatus = req.query.save;

  const total =
    numberArr.reduce((tally, num) => {
      return tally + num;
    }, 0) / numberArr.length;
  const output = `The mean of ${req.query.nums} is ${total}.\n`;
  if (saveStatus !== 'false') {
    writeToFile(output);
  }
  return res.send(`<div><b>${output}</b></div>`);
});

app.get('/median', (req, res, next) => {
  const saveStatus = req.query.save;
  const numberArr = req.query.nums
    .split(',')
    .map(Number)
    .sort();

  let result;
  // midPoint for odd length arr or high midpoint for even length arr
  let midPoint = Math.floor(numberArr.length / 2);

  // logic to check if even
  if (numberArr.length % 2 === 0) {
    result = (numberArr[midPoint] + numberArr[midPoint - 1]) / 2;
  } else {
    result = numberArr[midPoint];
  }
  const output = `The median of ${req.query.nums} is ${result}.\n`;
  if (saveStatus !== 'false') {
    writeToFile(output);
  }
  return res.send(`<div><b>${output}</b></div>`);
});

app.get('/mode', (req, res, next) => {
  const saveStatus = req.query.save;
  const numberArr = req.query.nums.split(',').map(Number);
  const numberObj = {};
  numberArr.forEach(number => {
    numberObj[number] = (numberObj[number] || 0) + 1;
  });

  let maxCount = 0;
  let bestKey = 0;
  for (let key in numberObj) {
    if (numberObj[key] > maxCount) {
      maxCount = numberObj[key];
      bestKey = key;
    }
  }
  const output = `The mode of ${req.query.nums} is ${bestKey}\n`;
  if (saveStatus !== 'false') {
    writeToFile(output);
  }
  return res.send(`<div><b>${output}</b></div>`);
});

/** helper function to catch all other inputs */
app.use((req, res, next) => {
  let error = new Error('<div><b>Resource cannot be found.</b></div>');
  error.status = 404;
  return next(error);
});

/* error handling function */
app.use((err, req, res, next) => {
  let status = err.status || 500;
  return res.status(status).send(`${err}`);
});

function writeToFile(output) {
  fs.appendFile(OUTPUT_FILE, output, err => {
    if (err) {
      console.error(err, 'oh noes');
      process.exit(1);
    }
    console.log('Request written!');
  });
}

app.listen(3000, () => console.log('App on port 3000'));
