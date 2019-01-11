const https = require('https');
const config = require('./config');
const querystring = require('querystring');
const _data = require('./data');

const validate = (data, validationMapping) => {
  let validationResult = {
    valid: [],
    invalid: {}
  };
  let validations = [];
  let validationsLen = 0;
  for (let prop in validationMapping) {
    validations = validationMapping[prop];
    validationsLen = validations.length;
    // check not pass if property is not provided, but validation rule for it exists
    if (data[prop] !== undefined) {
      for (let index = 0; index < validationsLen; ++index) {
        let isValid = true;
        let length = 0;
        let inarray = [];
        let validationType = validations[index];
        if (
          typeof validations[index] === 'string' &&
          validations[index].indexOf('LENMAX') !== -1
        ) {
          validationType = 'LENMAX';
          length = parseInt(validations[index].substr(6), 10);
        } else if (
          typeof validations[index] === 'string' &&
          validations[index].indexOf('LENMIN') !== -1
        ) {
          validationType = 'LENMIN';
          length = parseInt(validations[index].substr(6), 10);
        } else if (
          typeof validations[index] === 'string' &&
          validations[index].indexOf('LENEQUAL') !== -1
        ) {
          validationType = 'LENEQUAL';
          length = parseInt(validations[index].substr(8), 10);
        } else if (
          typeof validations[index] === 'object' &&
          validations[index].IN
        ) {
          validationType = 'IN';
          inarray = validations[index].IN;
        }
        isValid = _validateByProperty(
          data[prop],
          validationType,
          length,
          inarray
        );
        isValid
          ? validationResult.valid.push(prop)
          : (validationResult.invalid[prop] = validations[index]);
        if (!isValid) {
          break;
        }
      }
    } else {
      // If value is not provided, then need to check if field is required or not.
      if (validations.indexOf('REQUIRED') > -1) {
        validationResult.invalid[prop] = 'REQUIRED';
      }
    }
  }
  return validationResult;
};

const getErrorMsgForFields = (data, inarrays = {}) => {
  let length = 0;
  let validationType = '';
  for (let prop in data) {
    if (typeof data[prop] === 'object' && data[prop].IN) {
      validationType = 'IN';
    } else if (data[prop].startsWith('LENMAX')) {
      length = parseInt(data[prop].substr(6), 10);
      validationType = 'LENMAX';
    } else if (data[prop].startsWith('LENMIN')) {
      length = parseInt(data[prop].substr(6), 10);
      validationType = 'LENMIN';
    } else if (data[prop].startsWith('LENEQUAL')) {
      length = parseInt(data[prop].substr(8), 10);
      validationType = 'LENEQUAL';
    } else {
      validationType = data[prop];
    }
    switch (validationType) {
      case 'STRING':
        data[prop] = `${prop} must be string.`;
        break;
      case 'BOOLEAN':
        data[prop] = `${prop} must be boolean.`;
        break;
      case 'OBJECT':
        data[prop] = `${prop} must be object.`;
        break;
      case 'ARRAY':
        data[prop] = `${prop} must be array.`;
        break;
      case 'NUMBER':
        data[prop] = `${prop} must be number.`;
        break;
      case 'REQUIRED':
        data[prop] = `${prop} is required field.`;
        break;
      case 'CHECKED':
        data[prop] = `${prop} need to be checked.`;
        break;
      case 'LENMAX':
        data[prop] = `${prop} length must be less than or equal to ${length}.`;
        break;
      case 'LENMIN':
        data[
          prop
        ] = `${prop} length must be greater than or equal to ${length}.`;
        break;
      case 'LENEQUAL':
        data[prop] = `${prop} length must be equal to ${length}.`;
        break;
      case 'NOT_EXIST':
        data[prop] = `Form Error in ${prop}. Please report it at support.`;
        break;
      case 'URL':
        data[prop] = `${prop} must be valid URL.`;
        break;
      case 'IN':
        data[prop] = `${prop} value must be inside ${inarrays[prop].join()}`;
        break;
    }
  }
  return data;
};

const _validateByProperty = (value, validation, length = 0, inarray = []) => {
  switch (validation) {
    case 'STRING':
      return typeof value === 'string';
    case 'OBJECT':
      return typeof value === 'object';
    case 'ARRAY':
      return value instanceof Array;
    case 'BOOLEAN':
      return typeof value === 'boolean';
    case 'NUMBER':
      return typeof value === 'number';
    case 'REQUIRED':
      value = typeof value === 'string' ? value.trim() : value;
      return value !== undefined;
    case 'LENMAX':
      return value.trim().length <= length;
    case 'LENMIN':
      return value.trim().length >= length;
    case 'LENEQUAL':
      return value.trim().length === length;
    case 'CHECKED':
      return value;
    case 'IN':
      if (typeof value === 'string') {
        return inarray.indexOf(value) > -1;
      } else if (value instanceof Array) {
        for (let userval of value) {
          if (inarray.indexOf(userval) === -1) {
            return false;
          }
        }
        return true;
      }
      return false;
    case 'URL':
      return isUrl(value);
  }
};

const isUrl = url => {
  const regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
  return regexp.test(url);
};

const sendTwilioSms = (phone, msg, callback) => {
  if (phone && msg) {
    const payload = {
      From: config.twilio.fromPhone,
      To: '+91' + phone,
      Body: msg
    };

    const stringPayload = querystring.stringify(payload);

    // Configure the request details
    let requestDetails = {
      protocol: 'https:',
      hostname: 'api.twilio.com',
      method: 'POST',
      path: `https://api.twilio.com/2010-04-01/Accounts/${
        config.twilio.accountSid
      }/Messages.json`,
      auth: `${config.twilio.accountSid}:${config.twilio.authToken}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(stringPayload)
      }
    };

    // Way to initiate request when connection is established.
    // Currently for twilio account(by default not allow self signed certificate request)
    // However you can disable check on certificate for testing purpose.

    let req = https.request(requestDetails, response => {
      let status = response.statusCode;
      if (status === 200 || status === 201) {
        callback(false);
      } else {
        callback('Status code returned was ' + status);
      }
    });

    req.on('error', e => {
      callback(e);
    });

    req.write(stringPayload);

    req.end();
  }
};

const authenticateByToken = (data, action) => {
  if (data && data.phone) {
    _data.read('tokens', data.phone, (errMsg, tokenOb) => {
      if (!errMsg) {
        if (tokenOb.token === data.token) {
          action(false);
        } else {
          action('Invalid Token');
        }
      }
    });
  } else {
    action('Missing Fields. Phone is required.');
  }
};

// returns strLen character token
const getRandomString = strLen => {
  const tokenChars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const tokenLength = strLen;
  let token = '';
  let tokenCharIndex = 0;
  for (let i = 0; i < tokenLength; ++i) {
    tokenCharIndex = Math.floor(Math.random() * 20);
    token += tokenChars[tokenCharIndex];
  }
  return token;
};

module.exports = {
  authenticateByToken,
  getErrorMsgForFields,
  getRandomString,
  sendTwilioSms,
  validate
};
