digitalPulse(LED2, 1, 100);

var storage = require("Storage");
var FILESIZE = 2048;
var file = {
  name: "",
  offset: FILESIZE // force a new file to be generated at first
};

// Add new data to a log file or switch log files
function saveData(filename, txt) {
  var l = txt.length;
  if (file.offset + l > FILESIZE) {
    // need a new file...
    file.name = filename;
    // write data to file - this will overwrite the last one
    storage.write(file.name, txt, 0, FILESIZE);
    file.offset = l;
  } else {
    // just append
    storage.write(file.name, txt, file.offset);
    file.offset += l;
  }
}
console.log(storage.list("blink.js"));
console.log(storage.read("blink.js"));
require("blink").go();

//var blink = "exports.go=function(){digitalPulse(LED2, 1, 100);}";
//saveData("blink.js", blink);

/*
exports.create = function (filename, text) {
  storage.erase(filename);
  saveData(filename, text);
  console.log("File overwrited: " + filename);
};

exports.append = function (filename, text) {
  saveData(filename, text);
  console.log(filename + " saved!");
};

exports.read = function (filename) {
  var file = storage.read(filename);
  if (!file) {
    console.log("File not found!");
  }
};

exports.erase = function (filename) {
  var file = storage.erase(filename);
  if (!file) {
    console.log("File not found!");
  }
};*/
