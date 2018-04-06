var config = require('./config'); // Read configuration
var env = require('./env');

// Import project modules
var Landroid = require('./landroid');
var LandroidState = Landroid.LandroidState;
var HomeAssistant = require('./home-assistant');

config = env.override(config); // Override config with environment variables

var homeAssistant = new HomeAssistant(config);

var landroid = new Landroid(config);
  
console.log("Scheduling polling");
landroid.pollEvery(60, function(status) { // Poll every 60 seconds
  if(status) { // We got some data back from the Landroid
    // Send data to Home Assistant
    homeAssistant.setNoOfAlarms(status.noOfAlarms);
    homeAssistant.setBatteryPercentage(status.batteryPercentage);
    homeAssistant.setTotalMowingHours(status.totalMowingHours);
    homeAssistant.setWorkingTimePercent(status.workingTimePercent);
    
    switch (status.state) {
      case LandroidState.ALARM:
        homeAssistant.setState(status.errorMessage ? "Alarm!" + status.errorMessage : "Alarm! - Unknown");
        break;
      case LandroidState.CHARGING:
        homeAssistant.setState("Charging");
        break;
      case LandroidState.CHARGING_COMPLETE:
        homeAssistant.setState("Charging complete");
        break;
      case LandroidState.MOWING:
        homeAssistant.setState("Mowing");
        break;
      case LandroidState.GOING_HOME:
        homeAssistant.setState("Going home");
        break;
      case LandroidState.MANUAL_STOP:
        homeAssistant.setState("Manual stop");
        break;
      case LandroidState.ERROR:
        homeAssistant.setState("ERROR!");
        break;
      default:
        console.error("Unknown state: " + status.state);
    }
  }
  else {
    homeAssistant.setState("No Connection!");
    console.error("No Connection!");
  }
});
