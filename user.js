const helper = require('./lib/helpers');
const dataCreator = require('./lib/data');
const token = require('./token');
// User Post Action
// Required Data: firstName, lastName, phone, password, tosAgreement
// Optional Data: None
const postUserAction = (data, callback) => {
  const validationResult = helper.validate(data, {
    firstName: ['STRING', 'REQUIRED'],
    lastName: ['STRING', 'REQUIRED'],
    phone: ['STRING', 'REQUIRED', 'LENEQUAL10'],
    password: ['STRING', 'REQUIRED', 'LENMIN6', 'LENMAX15'],
    tosAgreement: ['BOOLEAN', 'REQUIRED', 'CHECKED']
  });
  if (Object.keys(validationResult.invalid).length === 0) {
    // Perform post action
    dataCreator.create('users', data.phone, data, errMsg => {
      if (errMsg) {
        callback(200, { msg: errMsg });
      } else {
        const tokenOb = token.createTokenAction({ phone: data.phone });
        if (tokenOb.error) {
          callback(200, { msg: tokenOb.error });
        } else {
          callback(200, { msg: 'POST Successful', token: tokenOb.token });
        }
      }
    });
  } else {
    const errMsg = helper.getErrorMsgForFields(validationResult.invalid);
    callback(200, { msg: errMsg });
  }
};

// Required - phone
// Optional - others
const putUserAction = (data, callback) => {
  if (data && data.phone) {
    dataCreator.read('tokens', data.phone, (errMsg, tokenData = {}) => {
      if (!errMsg) {
        if (tokenData.token === data.token) {
          dataCreator.read('users', data.phone, (errMsg, readData = {}) => {
            if (!errMsg) {
              let result = {
                firstName: '',
                lastName: '',
                phone: data.phone,
                password: '',
                tosAgreement: true
              };
              for (let prop in result) {
                result[prop] = data[prop] ? data[prop] : readData[prop];
              }
              dataCreator.update('users', data.phone, result, errMsg => {
                if (!errMsg) {
                  callback(200, {
                    msg: 'Update Successful'
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
        } else {
          callback(200, {
            msg: 'Invalid Token.'
          });
        }
      } else {
        callback(200, {
          msg: errMsg
        });
      }
    });
  } else {
    callback(200, {
      msg: 'Phone is required.'
    });
  }
};

// Required - phone
// Optional - others
const getUserAction = (data, callback) => {
  if (data && data.phone) {
    // Get token
    dataCreator.read('tokens', data.phone, (errMsg, tokenData = {}) => {
      if (!errMsg) {
        if (tokenData.token === data.token) {
          dataCreator.read('users', data.phone, (errMsg, data = {}) => {
            if (!errMsg) {
              callback(200, {
                msg: 'GET Successful',
                data
              });
            } else {
              callback(200, {
                msg: errMsg
              });
            }
          });
        } else {
          callback(200, {
            msg: 'Invalid Token.'
          });
        }
      }
    });
  } else {
    callback(200, {
      msg: 'Phone is required.'
    });
  }
};

// Required - phone
// Optional - others
const deleteUserAction = (data, callback) => {
  if (data && data.phone) {
    // Get token
    dataCreator.read('tokens', data.phone, (tokenErrMsg, tokenData = {}) => {
      if (tokenErrMsg) {
        callback(200, { msg: tokenErrMsg });
      } else if (tokenData.token === data.token) {
        dataCreator.read('users', data.phone, (errMsg, data = {}) => {
          if (!errMsg) {
            dataCreator.delete('users', data.phone, errMsg => {
              if (!errMsg) {
                dataCreator.delete('tokens', data.phone, errMsg => {
                  if (!errMsg) {
                    callback(200, {
                      msg: 'Deleted Successfully'
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
          } else {
            callback(200, {
              msg: errMsg
            });
          }
        });
      } else {
        callback(200, {
          msg: 'Invalid Token.'
        });
      }
    });
  } else {
    callback(200, {
      msg: 'Phone is required.'
    });
  }
};

module.exports = {
  get: getUserAction,
  delete: deleteUserAction,
  post: postUserAction,
  put: putUserAction
};
