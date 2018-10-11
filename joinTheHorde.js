/*
1-New puck is added.
2-Scan nearby pucks
3-Store pucks address and rssi into flash
4-Send scanning pucks address back to scanned pucks.
*/
var scannedDevices = [];
var alertedDevices = [];
var problemDevices = [];
var popedPuck;
var retring = 0;
const MAX_RETRIES = 5;
// Are we busy?
var busy = false;
// The device, if we're connected
var connected = false;
// The 'tx' characteristic, if connected
var txCharacteristic = false;

function init() {
  scannedDevices = [];
  scanNearby();
}

function scanNearby() {
  NRF.findDevices(function (devices) {
    parseScannedDevices(devices);
    alertPresence();
  }, 5000);
}

function parseScannedDevices(devices) {
  for (var i = 0; i < devices.length; i++) {
    if (devices[i].id && devices[i].name && devices[i].rssi) {
      var scannedDevice = {
        "address": devices[i].id,
        "rssi": devices[i].rssi,
        "name": devices[i].name
      };
      scannedDevices.push(scannedDevice);
    }
  }
}

function alertPresence() {
  if(scannedDevices.length>0) {
    popedPuck = scannedDevices.pop();
    console.log("Alerting " + popedPuck.name);
    sendToggle(popedPuck);
  }
}

function sendToggle(puck) {
  if (!busy) {
    busy = true;
    if (!connected) {
      NRF.requestDevice({ filters: [{ name: puck.name }] }).then(function(device) {
        return device.gatt.connect();
      }).then(function(d) {
        connected = d;
        return d.getPrimaryService("6e400001-b5a3-f393-e0a9-e50e24dcca9e");
      }).then(function(s) {
        return s.getCharacteristic("6e400002-b5a3-f393-e0a9-e50e24dcca9e");
      }).then(function(c) {
        txCharacteristic = c;
        busy = false;
        // Now actually send the toggle command
        sendToggle();
      }).catch(function() {
        connected=false;
        digitalPulse(LED1, 1, 500); // light red if we had a problem
        busy = false;
        retring++;
        console.log("Retrying..." + retring);
        if(retring < MAX_RETRIES){
          sendToggle(popedPuck);
        } else {
          retring = 0;
          problemDevices.push(popedPuck);
          alertPresence();
        }
        // if (connected) {
        //   connected.disconnect();
        // }
      });
    } else {
      writeData();
    }
  }
}

function writeData(){
  txCharacteristic.writeValue("LED1.reset();\n").then(function() {
    digitalPulse(LED2, 1, 500); // light green to show it worked
    busy = false;
  }).then(function() {
    connected.disconnect();
    connected = false;
  }).then(function() {
    console.log("Done");
    alertedDevices.push(popedPuck);
    alertPresence();
  }).catch(function() {
    digitalPulse(LED1, 1, 500); // light red if we had a problem
    busy = false;
  });

}

init();
