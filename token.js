const dataCreator = require('./lib/data');
const TOKENDIR = 'tokens';

const createTokenAction = data => {
  const token = _getToken();
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

// returns 20 character token
const _getToken = () => {
  const tokenChars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const tokenLength = 20;
  let token = '';
  let tokenCharIndex = 0;
  for (let i = 0; i < tokenLength; ++i) {
    tokenCharIndex = Math.floor(Math.random() * 20);
    token += tokenChars[tokenCharIndex];
  }
  return token;
};

module.exports = { createTokenAction };
