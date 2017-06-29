/*
  This module handles the communication with the Worx Landroid 2017 models cloud service
 */

const assert = require('assert');
const awsIot = require('aws-iot-device-sdk');
const najax = require('najax'); // https://github.com/najaxjs/najax
const http = require('http');
const https = require('https');
const pem = require("pem"); // https://github.com/Dexus/pem
const uuidv1 = require('uuid/v1');
// var request = require('request'); // https://github.com/request/request

function LandroidCloud(config) {
  this.email = config.email;
  this.password = config.password;
  this.macAddress = config.macAddress ? 
    config.macAddress.toUpperCase().replace(':', '') : null;

  this.uuid = uuidv1();
  console.log("UUID: " + this.uuid);
}

LandroidCloud.prototype.setToken = function (token) {
  this.token = token;
  console.log("API token set to " + this.token);
};

/** Perform all initialization needed for connecting to the MQTT topic */
LandroidCloud.prototype.init = function () {
  this.retrieveGuestToken();
};

/** Retrieve hard coded guest token from Pastebin */
LandroidCloud.prototype.retrieveGuestToken = function () {
  var self = this;
  getUrlBody('https://pastebin.com/raw/JMmVCUrf', function (body) {
    console.log("Downloaded guest token");
    self.setToken(body);
    
    self.retrieveUserToken();
  });
};

/** Log in user to retrieve user token */
LandroidCloud.prototype.retrieveUserToken = function () {
  var self = this;
  
  self.callApi('POST', "users/auth", {
        email: self.email,
        password: self.password,
        uuid: self.uuid,
        // We'll pretend we're the Android app
        type: 'app',
        platform: 'android'
      }, function (data) {
        if(data.api_token) {
          console.log("Logged in as " + self.email + " - user token retrieved from API");
          self.setToken(data.api_token);
    
          self.retrieveCertificate();
        }
        else {
          throw new Error("Unexpected response: " + JSON.stringify(data));
        }
    
      });
};

/** Get certificate to use for MQTT */
LandroidCloud.prototype.retrieveCertificate = function () {
  if(! this.token)
    throw new Error("Token must be retrieved/set first");
  
  var self = this;
  this.callApi("GET", "users/certificate", null, function (data) {
    if(data.pkcs12) {
      console.log("Certificate retrieved");
      self.setCertificate(Buffer.from(data.pkcs12, 'base64'));
    }
    else {
      throw new Error("Unexpected response: " + JSON.stringify(data));
    }
    
  });
};

/** Load certificate and private key from file or buffer */
LandroidCloud.prototype.setCertificate = function (pkcs12) {
  var self = this;
  
  pem.readPkcs12(pkcs12, { }, function(err, cert, ca) {
    if(err !== null) {
      console.log("Unable to convert certificate. Make sure OpenSSL is either on your path, or executable is pointed out" +
          "by OPENSSL_BIN environment variable. " + err);
      throw new Error(err);
    }
    self.cert = cert.cert;
    self.key = cert.key;

    self.connectToMQTT();
  });
};

/** Connect to MQTT broker and subscribe to topic */
LandroidCloud.prototype.connectToMQTT = function () {
  assert(this.cert, "Certificate must be set before connecting to MQTT");
  assert(this.key, "Private key must be set before connecting to MQTT");
  assert(this.macAddress, "MAC address must be set before connecting to MQTT");
  
  var self = this;

  // See https://github.com/aws/aws-iot-device-sdk-js
  console.log("Fetching root CA");
  getUrlBody("https://www.symantec.com/content/en/us/enterprise/verisign/roots/VeriSign-Class%203-Public-Primary-Certification-Authority-G5.pem", 
      function (ca) {
    
        console.log("Connecting to MQTT broker");
      
        var device = awsIot.device({
          host: 'a1optpg91s0ydf.iot.eu-west-1.amazonaws.com',
          clientCert: Buffer.from(self.cert),
          privateKey: Buffer.from(self.key),
          // passphrase: "",
          caCert: Buffer.from(ca), // TODO Cache in object
          clientId: self.uuid,
          region: 'eu-west-1' 
        });
        
        device.on('message', function(topic, payload) {
          self.onMessage(payload);
        });
      
        device.on('connect', function() {
          var topic = 'DB510/' + self.macAddress + '/commandOut';
          console.log('Connected to MQTT broker - subscribing to ' + topic);
          device.subscribe(topic);
        });
  });
};

/** New MQTT message received */
LandroidCloud.prototype.onMessage = function (payload) {
  console.log('MQTT message received', payload.toString()); // TODO
};

/** Call API at https://api.worxlandroid.com/api/v1/ */
LandroidCloud.prototype.callApi = function (method, path, data, onSuccess) {
  var self = this;
  najax({
    url: "https://api.worxlandroid.com/api/v1/" + path,
    // method: 'POST',
    type: method,
    data: data,
    headers: {
      'X-Auth-Token': self.token 
    },
    dataType: "json",
    success: function(data, statusText, jqXHR) {
      
      if(jqXHR.status === 200) {
        onSuccess(data);
      }
      else if(data.message && data.code) { // Error message
        // console.log("response: " + JSON.stringify(data));
        throw new Error(data.message);
      }
      else {
        throw new Error("Unexpected response: " + JSON.stringify(data));
      }
    },
    error: function (e) {
      console.error("Error calling API! " + JSON.stringify(e));
      throw e;
    }    
  });  
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////
// Utility functions

/** Get body of the contents at the provided url */
function getUrlBody(url, callback) {
  /*
   request.get(url, function (error, response, body) {
     if (!error && response.statusCode == 200) {
      callback(body);
     }
   });
   */

  var ssl = url.indexOf("https://") === 0;

  (ssl ? https : http).get(url).on('response', function (response) {
    var body = '';
    response.on('data', function (chunk) {
      body += chunk;
    });
    response.on('end', function () {
      // guestToken = body;
      // if(callback)
      callback(body);
    });
  });

  /*
   var client = http.createClient(443, url);
   var request = client.request();
   request.on('response', function( res ) {
     res.on('data', function( data ) {
     console.log( data );
     guestToken = data.toString();
   } );
   request.end();
   */
}

module.exports = LandroidCloud;