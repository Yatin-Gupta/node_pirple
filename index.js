const http = require('http');
const https = require('https');
const fs = require('fs');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const environment = require('./lib/config');
const handlers = require('./lib/handlers');

// const helper = require('./lib/helpers');

// Code for Sending SMS
// helper.sendTwilioSms('9718847244', 'Hello World, Yatin Gupta', errMsg => {
//   if (!errMsg) {
//     console.log('SMS Sent Successfully!!');
//   } else {
//     console.log('Error comes is: ' + errMsg);
//   }
// });

const unifiedAction = (request, response) => {
  const decoder = new StringDecoder('utf-8');
  let payload = '';
  let reqUrlObj = url.parse(request.url, true);
  let trimmedPath = reqUrlObj.pathname.trim().replace(/^\/|\/$/g, '');
  request.on('data', data => {
    payload += decoder.write(data);
  });
  request.on('end', () => {
    payload += decoder.end();
    payload = payload ? JSON.parse(payload) : {};
    const resultHandler = handlers.getHandler(trimmedPath);
    let sendData = {
      path: trimmedPath,
      headers: request.headers,
      queryParams: reqUrlObj.query,
      method: request.method.toLowerCase(),
      payload
    };
    resultHandler(sendData, (statusCode, outputPayload = {}) => {
      response.setHeader('Content-Type', 'application/json');
      const outputPayloadString = JSON.stringify(outputPayload);
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

// readFileSync must be used only to load key and certificate
// As it block thread for IO operation.
// But in case of https, key is not loaded, request must not progress.
const httpsServerOptions = {
  key: fs.readFileSync('./https/server.key'),
  cert: fs.readFileSync('./https/server.crt')
};

const httpsServer = https.createServer(httpsServerOptions, unifiedAction);
httpsServer.listen(environment.httpsPort, () => {
  console.log(
    `Server is listening at port ${environment.httpsPort} and environment: ${
      environment.name
    }`
  );
});
