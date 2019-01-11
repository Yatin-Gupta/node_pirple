let environment = process.env.NODE_ENV;
if (typeof environment === 'string') {
  environment = environment.trim().toLowerCase();
}

const stageEnvironment = {
  httpPort: 3000,
  httpsPort: 3001,
  name: 'stage',
  twilio: {
    accountSid: 'AC0b10017698cd7eb966ca4522fa38d18e',
    authToken: '6e47f6ba2305fb04667490ab951cb064',
    fromPhone: '+14153476981'
  }
};

const productionEnvironment = {
  httpPort: 5000,
  httpsPort: 5001,
  name: 'prod',
  twilio: {
    accountSid: '<TWILIO ACCOUNT SID>',
    authToken: '<TWILIO AUTH TOKEN>',
    fromPhone: '<TWILIO FROM NUMBER>'
  }
};

let exportedEnvironment;

switch (environment) {
  case 'prod':
  case 'production':
    exportedEnvironment = productionEnvironment;
    break;
  default:
    exportedEnvironment = stageEnvironment;
}

module.exports = exportedEnvironment;
