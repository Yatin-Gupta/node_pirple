const https = require('https');
const config = require('./config');
var querystring = require('querystring');

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
    if (data[prop] !== undefined) {
      for (let index = 0; index < validationsLen; ++index) {
        let isValid = true;
        let length = 0;
        let validationType = validations[index];
        if (validations[index].indexOf('LENMAX') !== -1) {
          validationType = 'LENMAX';
          length = parseInt(validations[index].substr(6), 10);
        } else if (validations[index].indexOf('LENMIN') !== -1) {
          validationType = 'LENMIN';
          length = parseInt(validations[index].substr(6), 10);
        } else if (validations[index].indexOf('LENEQUAL') !== -1) {
          validationType = 'LENEQUAL';
          length = parseInt(validations[index].substr(8), 10);
        }
        isValid = _validateByProperty(data[prop], validationType, length);
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

const getErrorMsgForFields = data => {
  let length = 0;
  let validationType = '';
  for (let prop in data) {
    if (data[prop].startsWith('LENMAX')) {
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
    }
  }
  return data;
};

const _validateByProperty = (value, validation, length = 0) => {
  switch (validation) {
    case 'STRING':
      return typeof value === 'string';
    case 'BOOLEAN':
      return typeof value === 'boolean';
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
  }
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

module.exports = {
  validate,
  getErrorMsgForFields,
  sendTwilioSms
};
