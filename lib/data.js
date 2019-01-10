const fs = require("fs");
const path = require("path");

let lib = {};

lib.baseDir = path.join(__dirname, "../.data");

lib.create = (dir, file, data, callback) => {
  const fileToWrite = lib.baseDir + "/" + dir + "/" + file + ".json";
  const fileMode = "wx";
  console.log("- Ready to open file.");
  try {
    fs.open(fileToWrite, fileMode, (err, fileDescriptor) => {
      console.log("- Opening file...");
      if (!err && fileDescriptor) {
        console.log("- File Opened");
        let stringData = JSON.stringify(data);
        console.log("- Ready to writen in file.");
        fs.writeFile(fileDescriptor, stringData, err => {
          console.log("- Writting file...");
          if (!err) {
            console.log("- Content written in file.");
            fs.close(fileDescriptor, err => {
              if (!err) {
                console.log("Successfully written to file.");
                callback(false);
              } else {
                console.log("Unable to close file.");
                callback("Error closing new file.");
              }
            });
          } else {
            console.log("Unable to write on file.");
            callback("Error writing new file.");
          }
        });
      } else {
        console.log("Unable to open file.");
        callback("Error opening file for writing");
      }
    });
  } catch (e) {
    console.log("Exception in opening file.");
    console.log(e);
  }
};

lib.read = (dir, file, callback) => {
  const fileToRead = lib.baseDir + "/" + dir + "/" + file + ".json";
  const fileMode = "r";
  fs.open(fileToRead, fileMode, (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      fs.readFile(fileDescriptor, (err, data) => {
        if (!err && data) {
          callback(false, data);
        } else {
          callback("Error in reading file.");
        }
        fs.close(fileDescriptor, err => {
          if (err) {
            callback("Unable to close file");
          }
        });
      });
    } else {
      callback("Error in opening file for read operation");
    }
  });
};

lib.update = (dir, file, data, callback) => {
  const fileToWrite = lib.baseDir + "/" + dir + "/" + file + ".json";
  const fileMode = "r+";
  fs.open(fileToWrite, fileMode, (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      fs.truncate(fileDescriptor, err => {
        if (err) {
          callback("Error in truncating file.");
        } else {
          console.log("file truncated");
        }
      });
      const stringData = JSON.stringify(data);
      fs.writeFile(fileDescriptor, stringData, err => {
        if (err) {
          callback("Unable to write file.");
        } else {
          callback(false);
        }
      });
    } else {
      callback("Unable to open file for writing.");
    }
  });
};

lib.delete = (dir, file, callback) => {
  const fileToDelete = lib.baseDir + "/" + dir + "/" + file + ".json";
  fs.unlink(fileToDelete, err => {
    if (err) {
      callback("Unable to delete file.");
    } else {
      callback(false);
    }
  });
};

module.exports = lib;
