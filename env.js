/*
  Module to override config with values for environment variableds
  If the env is not set the vaule from config is used
*/
exports.override = (config) => {
  var parsed = {};
  Object.keys(config).forEach(function(key) {
    if (process.env.hasOwnProperty(key)) {
      parsed[key] = process.env[key];
    } else {
      parsed[key] = config[key];
    }
  });
  return parsed;
};