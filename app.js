const express = require('express');
const app = express();
const fs = require('fs');

const {
  getMedian,
  getMode,
  getMean,
  writeToFile,
  OUTPUT_FILE
} = require('./helpers');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/** route showing results of previous quries */
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

/** route to handle deleting all results */
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

/** middlware to adjust values of inputs */
app.use((req, res, next) => {
  req.query.nums = req.query.nums.split(',').map(Number);
  return next();
});

/** route handling getting mean of input array */
app.get('/mean', (req, res, next) => {
  const numberArr = req.query.nums;
  const saveStatus = req.query.save;
  const output = getMean(numberArr);
  if (saveStatus !== 'false') {
    writeToFile(output);
  }
  return res.send(`<div><b>${output}</b></div>`);
});

/** route handling getting median of input array */
app.get('/median', (req, res, next) => {
  const saveStatus = req.query.save;
  const numberArr = req.query.nums;
  const output = getMedian(numberArr);
  if (saveStatus !== 'false') {
    writeToFile(output);
  }
  return res.send(`<div><b>${output}</b></div>`);
});

/** route handling getting mode of input array */
app.get('/mode', (req, res, next) => {
  const saveStatus = req.query.save;
  const numberArr = req.query.nums;
  const output = getMode(numberArr);
  if (saveStatus !== 'false') {
    writeToFile(output);
  }
  return res.send(`<div><b>${output}</b></div>`);
});

/** route handling getting mean, mode, and median from input array */
app.get('/all', (req, res, next) => {
  const saveStatus = req.query.save;
  const numberArr = req.query.nums;

  // maps all functions in list to result of func + numberArr as parameter
  const allOutputs = [getMean, getMedian, getMode].map(fnName => {
    return fnName(numberArr);
  });

  if (saveStatus !== 'false') {
    writeToFile(allOutputs.join(''));
  }

  // formats each output element in allOutputs with html formatting
  const resOutput = allOutputs
    .map(output => {
      return `<div><b>${output}</b></div><br></br>`;
    })
    .join('');
  return res.send(resOutput);
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

module.exports = app;
