const dataCreator = require('./lib/data');
const TOKENDIR = 'tokens';
const helper = require('./lib/helpers');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const createTokenAction = data => {
  const token = createJWT(data);
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

const createJWT = data => {
  const privateKey = fs.readFileSync('./keys/private_512.pk', 'utf-8');
  const signInOptions = {
    issuer: 'Test',
    subject: 'POST Request Token',
    expiresIn: '12h',
    algorithm: 'HS256'
  };

  const token = jwt.sign(data, privateKey, signInOptions);
  console.log(token);
  return token;
};

const verifyJWT = token => {
  const privateKey = fs.readFileSync('./keys/private_512.pk', 'utf-8');
  const verifyOptions = {
    issuer: 'Test',
    subject: 'POST Request Token',
    expiresIn: '12h',
    algorithms: ['HS256']
  };
  return jwt.verify(token, privateKey, verifyOptions);
};

module.exports = { createTokenAction, createJWT, verifyJWT };
