// data : Data coming from client
// callback:
//  - statusCode
//  - payload(Optional): Output that is needed to sent to client (default value: {})

const userActions = require('./../user');
const checksActions = require('./../checks');

const sampleHandler = (data, callback) => {
  callback(406, { name: 'Yatin' });
};

const notFoundHandler = (data, callback) => {
  callback(404);
};

const pingHandler = (data, callback) => {
  callback(200);
};

// As we need to run add user, get user, update user and delete user, this these operations are allowed
const userHandler = (data, callback) => {
  const allowedMethods = ['post', 'get', 'put', 'delete'];
  if (allowedMethods.indexOf(data.method) > -1) {
    if (data.method === 'get') {
      data.payload = { ...data.queryParams };
    }
    userActions[data.method](data.payload, callback);
  } else {
    // 405 - Method not allowed
    callback(405);
  }
};

const checksHandler = (data, callback) => {
  const allowedMethods = ['post', 'put', 'get', 'delete'];
  if (allowedMethods.indexOf(data.method) > -1) {
    checksActions[data.method](data.payload, callback);
  } else {
    // 405 - Method not allowed
    callback(405);
  }
};

const getHandler = path => {
  switch (path) {
    case 'sample':
      return sampleHandler;
    case 'user':
      return userHandler;
    case 'checks':
      return checksHandler;
    case 'ping':
      return pingHandler;
    case 'twilio':
      return twilioHandler;
    default:
      return notFoundHandler;
  }
};

module.exports = { getHandler };
