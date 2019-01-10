const helper = require("./lib/helpers");
const lib = require("./lib/data");

// User Post Action
// Required Data: firstName, lastName, phone, password, tosAgreement
// Optional Data: None
const postUserAction = data => {
  const validationResult = helper.validate(data, {
    firstName: ["STRING", "REQUIRED"],
    lastName: ["STRING", "REQUIRED"],
    phone: ["STRING", "REQUIRED", "LENEQUAL10"],
    password: ["STRING", "REQUIRED", "LENMIN6", "LENMAX15"],
    tosAgreement: ["BOOLEAN", "REQUIRED", "CHECKED"]
  });
  if (Object.keys(validationResult.invalid).length === 0) {
    console.log("Coming in if");
    // Perform post action
    lib.create("users", data.phone, data, msg => {
      console.log("No err in creating file");
      if (!msg) {
        return {
          statusCode: 200,
          payload: {
            msg: "POST Successful"
          }
        };
      } else {
        return {
          statusCode: 200,
          payload: {
            msg
          }
        };
      }
    });
  } else {
    const errMsgData = helper.getErrorMsgForFields(validationResult.invalid);
    return {
      statusCode: 200,
      payload: errMsgData
    };
  }
};

const putUserAction = data => {};

const getUserAction = data => {
  return {
    statusCode: 200,
    payload: {
      msg: "GET Successful"
    }
  };
};

const deleteUserAction = data => {};

module.exports = {
  get: getUserAction,
  delete: deleteUserAction,
  post: postUserAction,
  put: putUserAction
};
