// use Node-Unit (https://github.com/caolan/nodeunit) to run this test

"use strict";

prepare_Tests_from_data_provider();

module.exports.setUp = function (callback) {
  this.geoip = require("../../geoip-native.js");
  callback();
};

module.exports.tearDown = function (callback) {
  this.geoip = null;
  callback();
};

function createTestFunction(ipFrom, ipTo, int32From, int32To, countryName, countryCode) {
  return function (test) {
    var actual = this.geoip.lookup(ipFrom);
    test.equals(actual.name, countryName);
    test.equals(actual.code, countryCode);
    test.equals(actual.ipstart, int32From);

    var actual = this.geoip.lookup(ipTo);
    test.equals(actual.name, countryName);
    test.equals(actual.code, countryCode);
    test.equals(actual.ipstart, int32From);

    test.done();
  }
}

function inMinimizedTestRange(maxLength, index) {
  var testRanges_fromIndex_toIndex = [
    [0, 99],
    [maxLength / 2 - 50, maxLength / 2 + 50],
    [maxLength - 100, maxLength - 1],
  ];
  var inRange = false;
  for (var z = 0; z < testRanges_fromIndex_toIndex.length; z++) {
    var testRange = testRanges_fromIndex_toIndex[z];
    inRange |= (testRange[0] <= index && index <= testRange[1]);
  }
  return inRange;
}

function prepare_Tests_from_data_provider() {

  var records = load_CSV_file().split("\n");


  for (var i = 0; i < records.length; i++) {
    var record = records[i].toString().trim();
    var dataParts = record.split(/,/);

    // warning: testing the complete Range will take more than one minute !
    var shouldContinue = inMinimizedTestRange(records.length, i);
    var recordContainsComma = dataParts.length > 6;
    if (!shouldContinue && !recordContainsComma) continue;
    if (record.length < 1) continue;

    var ipFrom = dataParts[0].toString().replace(/"/g, "");
    var ipTo = dataParts[1].toString().replace(/"/g, "");
    var int32From = parseInt(dataParts[2].toString().replace(/"/g, ""), 10);
    var int32To = parseInt(dataParts[3].toString().replace(/"/g, ""), 10);
    var countryCode = dataParts[4].toString().replace(/"/g, "");
    var countryName = dataParts[5].toString().replace(/"/g, "");

    var testMethodName = ("test: record index=" + i + " ipFrom=" + ipFrom + " name=" + countryName);
    module.exports[testMethodName] = createTestFunction(ipFrom, ipTo, int32From, int32To, countryName, countryCode);
  }
}

module.exports.test_unknown_low_ip_should_give_an_UNKNONW_country = function (test) {

  var ip = "0.1.2.3";

  var actual = this.geoip.lookup(ip);

  test.equals(actual.name, "UNKNOWN");
  test.equals(actual.code, "N/A");
  test.equals(actual.ipstart, ip2int(ip));

  test.done();
}

module.exports.test_unknown_high_ip_should_give_an_UNKNONW_country = function (test) {

  var ip = "254.255.254.255";

  var actual = this.geoip.lookup(ip);

  test.equals(actual.name, "UNKNOWN");
  test.equals(actual.code, "N/A");
  test.equals(actual.ipstart, ip2int(ip));

  test.done();
}

function ip2int(ipAsString) {
  var parts = ipAsString.split(/[.]/);
  return parseInt(parts[0], 10) * (1 << 24)
     + parseInt(parts[1], 10) * (1 << 16)
     + parseInt(parts[2], 10) * (1 << 8)
     + parseInt(parts[3], 10);
}

function load_CSV_file() {
  var fs = require("fs");
  var data = fs.readFileSync(__dirname + "/../../GeoIPCountryWhois.csv")
  var buffer = "";
  buffer += data.toString().replace(/"/g, "");
  return buffer;
}