let environment = process.env.NODE_ENV;
if (typeof environment === "string") {
  environment = environment.trim().toLowerCase();
}

const stageEnvironment = {
  httpPort: 3000,
  httpsPort: 3001,
  name: "stage"
};

const productionEnvironment = {
  httpPort: 5000,
  httpsPort: 5001,
  name: "prod"
};

let exportedEnvironment;

switch (environment) {
  case "prod":
  case "production":
    exportedEnvironment = productionEnvironment;
    break;
  default:
    exportedEnvironment = stageEnvironment;
}

module.exports = exportedEnvironment;
