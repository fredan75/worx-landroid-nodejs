# Home automation integration for Worx Landroid robotic mowers
 
This is a small [Node.JS](https://nodejs.org/) library that allows integrating [Worx Landroid robotic 
mowers](https://www.worxlandroid.com/) with various home automation systems for logging/charting Landroid status such as 
battery percentage and notifications for Landroid alarms.
  
The library is assumed to work with any Landroid sporting WiFi; both the 2015-2016 models with an on device RESTful API 
(such as WG796E and WG797E) and the 2017 models with a cloud service (such as WR201SI, WR105SE and WR110MI).
Testing has mainly been performed with WG796E firmware version 12.1 and 12.6. Please report any breaking changes to the API.

## Common installation
(_The installation instructions make reference to .bat files. If you are not on Windows, you are assumed to know what to
do..._)

Regardless of the home automation system you are planning to use, you need to do the following:

1. Install [Node.JS](https://nodejs.org/). Make sure you allow `npm` to be on your `PATH`.
2. Clone this Git repo - `git clone https://github.com/mjiderhamn/worx-landroid-nodejs.git`
  (First install [Git](http://git-scm.com/) if not already installed). Or by all means use the
  [GitHub Windows client](https://windows.github.com/).
3. Run `install.bat` to download dependencies.
4. Edit the cloned [`config.js`](config.js). Should be self explanatory. Although you may want to wait with this step until
  you have installed your home automation software, since you will need some details from that installation.
  NOTE! Make sure not to remove any quotations or commas!

## Home Assistant
If you plan to use [Home Assistant](https://home-assistant.io), follow the installation instructions at 
[https://home-assistant.io/getting-started/](https://home-assistant.io/getting-started/).
 
* 2015-2016 models: To start sending Landroid information to Home Assistant run `landroid2home-assistant.bat`
* 2017 models:
  * Make sure you have OpenSSL installed (see below), either on your `PATH` or with the environment variable 
  `OPENSSL_BIN` pointing to the executable.
  * To start sending Landroid information to Home Assistant run `landroid-cloud2home-assistant.bat`.

For tips setting up push notifications, see [here](home-assistant.md).

## Domoticz

If you plan to use [Domoticz home automation system](http://domoticz.com/), follow these additional steps: 

1. Set up some [MQTT broker/service](https://github.com/mqtt/mqtt.github.io/wiki/servers), such as [Mosquitto](http://mosquitto.org/)
  1. Note that on Windows you may need to install OpenSSL, see http://git.eclipse.org/c/mosquitto/org.eclipse.mosquitto.git/tree/readme-windows.txt
     linking to the URL in the OpenSSL section below.
2. Install [Domoticz](http://domoticz.com/) on some supported hardware (PC, Raspberry Pi, ...). 
3. Start sending Landroid (2015-2016) data to Domoticz by running `landroid2domoticz.bat` 
4. Use your browser and navigate to _Utility_ in the Domoticz UI.

## Worx Landroid REST API JSON response

The documentation of the API has been moved [here](landroid-api.md). Some documentation for newer (2017) models can be
found [here](landroid-mqtt.md).

## OpenSSL

For some setups you need to haven OpenSSL installed. For Windows, this might be helpful: http://slproweb.com/products/Win32OpenSSL.html