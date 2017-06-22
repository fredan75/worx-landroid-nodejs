# Worx Landroid robotic mower 2017 API

The Landroid robotic mower models released by Worx in 2017, such as WR201SI, WR105SE and WR110MI, use a completely 
different means of communication than [the API of previous models](landroid-api.md).
 
Both the mower and the app connect to an [AWS](https://aws.amazon.com/) server and communicate via [MQTT](http://mqtt.org/).

## Details

### Obtaining a certificate

The app authenticates itself to the MQTT broker via a client certificate. 

In order to obtain the certificate the app connects to `https://api.worxlandroid.com`. 
If you want to try things for yourself, I recommend [Postman](https://www.getpostman.com/).

First it needs to log in to get an auth token. It does so by `POST`ing form data (not JSON) to 
`https://api.worxlandroid.com/api/v1/users/auth`. The form data needed is
* `email` = the e-mail address of the user registered via the app
* `password` = the password of the user registered via the app
* `type=app`
* `platform=android` (for Android app)
* `uuid` = unique device identifier. For Android this will be the 
   [Android ID](https://developer.android.com/reference/android/provider/Settings.Secure.html#ANDROID_ID). You can
   display the Android ID of your phone with the help of [an app](https://play.google.com/store/search?q=device%20id).

In addition to these, there must be an `X-Auth-Token` HTTP header with a "guest token" (similar to client ID in OAuth2 
Client Credentials). You can get this for example by sniffing the network traffic or reverse engineering (assuming that is 
legal in your country) the APK of the [official Android app](https://play.google.com/store/apps/details?id=it.vt100.landroid).
It also seems someone posted the token [here](https://pastebin.com/JMmVCUrf).

The response will be JSON looking something like this
```json
{
  "id": 123,
  "name": "Your Name",
  "email": "your@email.com",
  "created_at": "2017-06-22 12:13:14",
  "updated_at": "2017-06-22 12:13:14",
  "city": null,
  "address": null,
  "zipcode": null,
  "country_id": 752,
  "phone": null,
  "birth_date": null,
  "sex": null,
  "newsletter_subscription": null,
  "user_type": "customer",
  "api_token": "1...X", // <- API token!
  "token_expiration": "2067-06-10 12:13:14",
  "mqtt_client_id": "android-ANDROID_ID" // ANDROID_ID = your device ID 
}
```

Then the app sends a `GET` request to `https://api.worxlandroid.com/api/v1/users/certificate` with the value of the 
`api_token` in the previous result, as the `X-Auth-Token` HTTP header.
 
The result of that request is JSON with a Base64 encoded PKCS12 certificate. It looks something like this:
```json
{
  "pkcs12": "ABCD...1234"
}
```

To get the binary PKCS12 certificate, this string needs to be Base64 decoded. (On Windows, this can be done using 
`certutil -decode input.file output.file`). This certificate turns out to be an 
[AWS IoT Certificate](http://docs.aws.amazon.com/iot/latest/developerguide/x509-certs.html) (`CN = AWS IoT Certificate`).

### Connecting to MQTT

The app will then connect to the MQTT broker,in the Android case, with the help of the [Java SDK](https://aws.amazon.com/sdk-for-java/)
(in particular [`AWSIotMqttManager`](http://docs.aws.amazon.com/AWSAndroidSDK/latest/javadoc/com/amazonaws/mobileconnectors/iot/AWSIotMqttManager.html)).
The server will be `a1optpg91s0ydf.iot.eu-west-1.amazonaws.com` or similar in another AWS region, depending on your country. 
The port is 8883. The MQTT topics are named with the MAC address of the lawn mower; `DB510/MAC_ADDRESS/commandIn` and 
`DB510/MAC_ADDRESS/commandOut` respectively.

On the `.../commandOut` topic, the mower will publish data as UTF-8 encoded JSON, supposedly looking something like this:
```json
{
  "dat": {
    "mac": ..., // MAC address
    "fw": ..., // Firmeware version
    "bt": {
      "t": ...,    
      "v": ...,    
      "p": ...,    
      "nr": ...,    
      "c": ... // Charge    
    },
    "dmp": [..., ..., ...],
    "st": {
      "b": ..., // Blade
      "d": ..., // Distance
      "wt": ... // Total work time
    },
    "ls": ..., // Status code
    "le": ... // Error code
  }  
}
```