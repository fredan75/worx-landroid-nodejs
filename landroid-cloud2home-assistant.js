var config = require('./config'); // Read configuration
var env = require('./env');
const LandroidCloud = require("./landroid-cloud");
const HomeAssistant = require('./home-assistant');

config = env.override(config); // Override config with environment variables

const homeAssistant = new HomeAssistant(config);

var updateListener = function (status) {
  if(status) { // We got some data from the Landroid
    // Send data to Home Assistant
    homeAssistant.setState(status.errorMessage ? status.errorMessage : status.state);
    homeAssistant.setNoOfAlarms(status.noOfAlarms); // Can be used for triggers
    homeAssistant.setBatteryPercentage(status.batteryPercentage);
    homeAssistant.setTotalDistance(status.totalDistance);
    homeAssistant.setTotalMowingHours(status.totalMowingHours);
  }
  else {
    homeAssistant.setState("Error getting update!");
    console.error("Error getting update!");
  }
};

var landroid = new LandroidCloud(config);
landroid.init(updateListener);