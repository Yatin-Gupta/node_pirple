const http = require("http");
const https = require("https");
const fs = require("fs");
const url = require("url");
const StringDecoder = require("string_decoder").StringDecoder;
const environment = require("./lib/config");
const _data = require("./lib/data");
const handlers = require("./lib/handlers");

const unifiedAction = (request, response) => {
  const decoder = new StringDecoder("utf-8");
  let payload = "";
  let reqUrlObj = url.parse(request.url, true);
  let trimmedPath = reqUrlObj.path.trim().replace(/^\/|\/$/g, "");
  request.on("data", data => {
    payload += decoder.write(data);
  });
  request.on("end", () => {
    payload += decoder.end();
    payload = payload ? JSON.parse(payload) : {};
    const resultHandler = handlers.getHandler(trimmedPath);
    const sendData = {
      path: trimmedPath,
      headers: request.headers,
      method: request.method.toLowerCase(),
      payload
    };
    resultHandler(sendData, (statusCode, outputPayload = {}) => {
      response.setHeader("Content-Type", "application/json");
      const outputPayloadString = JSON.stringify(outputPayload);
      // File Operation
      _data.create("test", "payload", outputPayload, err => {
        if (err) {
          console.log(`Error: ${err}`);
          response.end(err);
        } else {
          console.log("Read Result: ");
          _data.read("test", "payload", (err, data = "") => {
            if (err) {
              console.log(`Error: ${err}`);
            } else {
              console.log(`Data: ${data}`);
              console.log("Update Result: ");
              _data.update("test", "payload", { name: "Karan Johar" }, err => {
                if (err) {
                  response.end(err);
                } else {
                  _data.read("test", "payload", (err, data = "") => {
                    if (err) {
                      console.log(`Error: ${err}`);
                    } else {
                      console.log(`Data: ${data}`);
                      console.log("Deleting File....");
                      _data.delete("test", "payload", err => {
                        if (err) {
                          console.log(`Error: ${err}`);
                        }
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
      response.writeHead(statusCode);
      response.end(outputPayloadString);
    });
  });
};

const server = http.createServer(unifiedAction);
server.listen(environment.httpPort, () => {
  console.log(
    `Server is listening at port ${environment.httpPort} and environment: ${
      environment.name
    }`
  );
});

const httpsServerOptions = {
  key: fs.readFileSync("./https/server.key"),
  cert: fs.readFileSync("./https/server.crt")
};

const httpsServer = https.createServer(httpsServerOptions, unifiedAction);
httpsServer.listen(environment.httpsPort, () => {
  console.log(
    `Server is listening at port ${environment.httpsPort} and environment: ${
      environment.name
    }`
  );
});
