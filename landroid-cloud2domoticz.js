var config = require('./config'); // Read configuration
const LandroidCloud = require("./landroid-cloud");
var landroid = new LandroidCloud(config);

const Domoticz = require('./domoticz');
const AlertLevel = Domoticz.AlertLevel;
const domoticz = new Domoticz(config);

var mqttBrokerUrl = config.mqttBrokerUrl;
if(mqttBrokerUrl && mqttBrokerUrl.indexOf("//") > 0) {
  var address = mqttBrokerUrl.substring(mqttBrokerUrl.indexOf("//") + 2);
  var port = 1883; // Assume default MQTT port
  if(address.indexOf(":") > 0) {
    var colon = address.indexOf(":");
    port = parseInt(address.substring(colon + 1));
    address = address.substring(0, colon);
  }
    
  domoticz.initHardware("MQTT for Landroid", address, port); 
}
else
  console.error("Cannot automatically create Domoticz hardware for MQTT URL: " + mqttBrokerUrl);

var updateListener = function (status) {
  if(status) { // We got some data from the Landroid
    // Send data to Domoticz
    domoticz.setAlert(status.errorMessage ? AlertLevel.RED : AlertLevel.GRAY,
        status.errorMessage ? status.errorMessage : status.state);
    /* TODO
      switch (status.state) {
    case LandroidState.ALARM:
      domoticz.setAlert(AlertLevel.RED, status.errorMessage ? status.errorMessage : "[Alarm]");
      break;
    case LandroidState.CHARGING:
      domoticz.setAlert(AlertLevel.GREEN, "Charging");
      break;
    case LandroidState.CHARGING_COMPLETE:
      domoticz.setAlert(AlertLevel.GRAY, "Charging complete");
      break;
    case LandroidState.MOWING:
      domoticz.setAlert(AlertLevel.YELLOW, "Mowing");
      break;
    case LandroidState.GOING_HOME:
      domoticz.setAlert(AlertLevel.YELLOW, "Going home");
      break;
    case LandroidState.MANUAL_STOP:
      domoticz.setAlert(AlertLevel.ORANGE, "Manual stop");
      break;
    case LandroidState.ERROR:
      domoticz.setAlert(AlertLevel.ORANGE, "ERROR!");
      break;
    default:
      console.error("Unknown state: " + status.state);
    
     */

    // Send data to Domoticz
    domoticz.setNoOfAlarms(status.noOfAlarms);
    domoticz.setBatteryPercentage(status.batteryPercentage);
    domoticz.setTotalMowingHours(status.totalMowingHours);

  }
  else {
    domoticz.setError("Error getting update!");
    console.error("Error getting update!");
  }
};

domoticz.initDevices(function() { // Detect or auto create devices
  
  console.info("You can now navigate to " + config.domoticzUrl + "/#/Utility to see your Landroid status");
  
  domoticz.connect(function () { // Connect to MQTT
    console.log("Connected to Domoticz MQTT, connect to Landroid MQTT");
    landroid.init(updateListener);
  });  
});
