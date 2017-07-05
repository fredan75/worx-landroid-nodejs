var config = require('./config'); // Read configuration
const LandroidCloud = require("./landroid-cloud");
const HomeAssistant = require('./home-assistant');

const homeAssistant = new HomeAssistant(config);

var updateListener = function (status) {
  if(status) { // We got some data from the Landroid
    // Send data to Home Assistant
    homeAssistant.setState(status.errorMessage ? status.errorMessage : status.state);
    homeAssistant.setNoOfAlarms(status.noOfAlarms); // Can be used for triggers
    // homeAssistant.setBatteryPercentage(status.batteryPercentage);
    homeAssistant.setTotalMowingHours(status.totalMowingHours);
  }
  else {
    homeAssistant.setState("Error getting update!");
    console.error("Error getting update!");
  }
};

var landroid = new LandroidCloud(config);
landroid.init(updateListener);