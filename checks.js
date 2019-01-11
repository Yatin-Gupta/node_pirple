const _data = require('./lib/data');
const _helper = require('./lib/helpers');

const getChecksAction = () => {
  console.log('Get Checks Action');
};

const postChecksAction = (data, callback) => {
  const { phone, token, ...check } = data;
  // Validating Checks
  const possibleSuccessCodes = [200, 201, 400, 404, 500];
  const possibleMethods = ['get', 'post', 'put', 'delete'];
  const validationResult = _helper.validate(check, {
    protocol: ['STRING', { IN: ['http:', 'https:'] }, 'REQUIRED'],
    url: ['URL', 'REQUIRED'],
    method: ['STRING', { IN: possibleMethods }, 'REQUIRED'],
    successCodes: ['ARRAY', { IN: possibleSuccessCodes }, 'REQUIRED'],
    timeoutSeconds: ['NUMBER', 'REQUIRED']
  });
  if (Object.keys(validationResult.invalid).length === 0) {
    // Perform post action
    _helper.authenticateByToken(data, errMsg => {
      if (!errMsg) {
        _data.read('users', phone, (err, userData = {}) => {
          if (!err) {
            let userNoOfChecks = userData.checks ? userData.checks.length : 0;
            if (userNoOfChecks >= 5) {
              callback(200, { msg: 'Cannot create more than 5 checks' });
            } else {
              if (userNoOfChecks === 0) {
                userData.checks = [];
              }
              const checkId = Date.now();
              const checkOb = { id: checkId, ...check };
              _data.create('checks', checkId, checkOb, errMsg => {
                if (!errMsg) {
                  userData.checks.push(checkId);
                  _data.update('users', phone, userData, errMsg => {
                    if (!errMsg) {
                      callback(200, {
                        msg: '/checks POST Successful'
                      });
                    } else {
                      callback(200, {
                        msg: errMsg
                      });
                    }
                  });
                } else {
                  callback(200, {
                    msg: errMsg
                  });
                }
              });
            }
          } else {
            callback(200, {
              msg: err
            });
          }
        });
      } else {
        callback(200, {
          msg: errMsg
        });
      }
    });
  } else {
    let inarrays = {};
    if ('method' in validationResult.invalid) {
      inarrays.method = possibleMethods;
    } else if ('successCodes' in validationResult.invalid) {
      inarrays.successCodes = possibleSuccessCodes;
    }
    const errMsg = _helper.getErrorMsgForFields(
      validationResult.invalid,
      inarrays
    );
    callback(200, { msg: errMsg });
  }
};

const putChecksAction = () => {
  console.log('Get Checks Action');
};

const deleteChecksAction = () => {
  console.log('Get Checks Action');
};

module.exports = {
  get: getChecksAction,
  post: postChecksAction,
  put: putChecksAction,
  delete: deleteChecksAction
};
