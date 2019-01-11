const dataCreator = require('./lib/data');
const TOKENDIR = 'tokens';
const helper = require('./lib/helpers');

const createTokenAction = data => {
  const token = helper.getRandomString(20);
  let error = false;
  if (data && data.phone) {
    dataCreator.create(TOKENDIR, data.phone, { token }, errMsg => {
      if (errMsg) {
        error = errMsg;
      }
    });
  } else {
    error = 'Unable to create token. Missing Fields.';
  }
  return { error, token };
};

module.exports = { createTokenAction };
