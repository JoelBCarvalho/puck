//IR emergency protocol
//var prontoHex = "0000 006C 0000 0022 00AD 00AD 0016 0041 0016 06FB";
//var statusBeacon = require("pronto").decode(prontoHex);
var statusCommand = [4.5,4.5,0.6,1.7,0.6];

//receiver
digitalWrite(D2,0);
pinMode(D1,"input_pullup");
var d = [];
setWatch(function(e) {
  d.push(1000*(e.time-e.lastTime));
}, D1, {edge:"both",repeat:true});

var lastLen = 0;
setInterval(function() {
  if (d.length && d.length==lastLen) {
    //d.shift(); // remove first element

    var i,j,temparray,chunk = 6;
    for (i=0,j=d.length; i<j; i+=chunk) {
        temparray = d.slice(i,i+chunk);
        temparray.shift();

        //translate commands
        var commandReceived = temparray.map(a=>a.toFixed(1));
        var variance = diff(commandReceived);
        if(variance < 0.3){
          digitalPulse(LED3, 1, 100);
        }
        console.log(commandReceived.toString() + " variance: " + variance);
    }
    d=[];
  }
  lastLen = d.length;
},10000);

function diff(command){
  var acu = 0;
  for(var i = 0; i<command.length; i++) {
    acu = acu + (statusCommand[i]-command[i]);
  }
  return acu;
}

//transmitter
//Puck.IR(statusBeacon);
