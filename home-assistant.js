/** Module for communicating with Home Assistant API, see https://home-assistant.io/developers/rest_api.html */

// https://github.com/najaxjs/najax
var najax = require('najax');

var COMPONENT_PREFIX = "landroid.";

function Entity(entityId, friendlyName, unitOfMeasurement) {
  this.entityId = COMPONENT_PREFIX + entityId;
  this.friendlyName = friendlyName;
  this.unitOfMeasurement = unitOfMeasurement;
}

var BATTERY_PERCENT_ENTITY_ID = new Entity("battery_percent", "Battery percent", "%"); 
var TOTAL_MOWING_HOURS_ENTITY_ID = new Entity("total_mowing_hours", "Total mowing hours", "h");
var NO_OF_ALARMS_ENTITY_ID = new Entity("no_of_alarms", "No of alarms", "#");
// var ALERT_ENTITY_ID = new Entity("Alert";
var STATE_ENTITY_ID = new Entity("state", "State");
var TOTAL_DISTANCE_ENTITY_ID = new Entity("total_distance", "Total distance", "m");
var WORKING_TIME_PERCENT_ID = new Entity("working_time_percent", "Working time Percent", "%");

function HomeAssistant(config) {
  this.homeAssistantUrl = config.homeAssistantUrl;
  this.homeAssistantPassword = config.homeAssistantPassword;
  //console.log("pwd: " + this.homeAssistantPassword);
}

HomeAssistant.prototype.ajax = function (type, uri, data, callback) {
  var self = this;

  var url = self.homeAssistantUrl + "/api/" + (uri ? uri : "");
  //console.log("About to '" + type + "' to '" + url + "'" + (data ? ": " + JSON.stringify(data) : ""));
  //console.log("pwd: " + self.homeAssistantPassword);

  najax({
    url: url + "?api_password=" + self.homeAssistantPassword,
    type: type,
    data: data, // ? JSON.stringify(data) : null,
    headers: {
      "X-HA-Access": self.homeAssistantPassword
    },
    contentType: "json", // will be "application/json" in version najax 0.2.0
    dataType: "json", // will be "application/json" in version najax 0.2.0
    success: function(response) {
      //console.log("Response from HomeAssistant: " + JSON.stringify(response));
      if(callback)
        callback(response);
    },
    error: function (response) {
      console.error("Error calling Home Assistant: " + JSON.stringify(response));
    }
  })
};

HomeAssistant.prototype.postState = function (entity, state, callback) {
  this.ajax("POST", "states/" + entity.entityId, {
    state: state,
    attributes: {
      "friendly_name": entity.friendlyName,
      "unit_of_measurement": entity.unitOfMeasurement
    }
  }, callback);
};

HomeAssistant.prototype.setBatteryPercentage = function(batteryPercentage) {
  if(typeof batteryPercentage != "undefined")
    this.postState(BATTERY_PERCENT_ENTITY_ID, batteryPercentage);
};

HomeAssistant.prototype.setTotalMowingHours = function(totalMowingHours) {
  if(typeof totalMowingHours != "undefined")
    this.postState(TOTAL_MOWING_HOURS_ENTITY_ID, totalMowingHours);
};

HomeAssistant.prototype.setTotalDistance = function(totalDistance) {
  if(typeof totalDistance != "undefined")
    this.postState(TOTAL_DISTANCE_ENTITY_ID, totalDistance);
};

HomeAssistant.prototype.setNoOfAlarms = function(noOfAlarms) {
  if(typeof noOfAlarms != "undefined")
    this.postState(NO_OF_ALARMS_ENTITY_ID, noOfAlarms);
};

HomeAssistant.prototype.setState = function (state) {
  this.postState(STATE_ENTITY_ID, state);
};

HomeAssistant.prototype.setWorkingTimePercent = function (workingTimePercent) {
  if(typeof workingTimePercent != "undefined")
    this.postState(WORKING_TIME_PERCENT_ID, workingTimePercent);
};

module.exports = HomeAssistant;
