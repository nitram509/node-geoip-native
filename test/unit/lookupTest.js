// use Node-Unit (https://github.com/caolan/nodeunit) to run this test

"use strict";

module.exports.setUp = function (callback) {
  this.geoip = require("../../geoip-native.js");

  callback();
};

module.exports.tearDown = function (callback) {
  // clean up
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

prepare_Tests_from_data_provider();
function prepare_Tests_from_data_provider() {

  var records = load_CSV_file().split("\n");

  var testRanges = [
    [0, 99],
    [records.length / 2 - 50, records.length / 2 + 50],
    [records.length - 100, records.length - 1],
  ];

  for (var i = 0; i < records.length; i++) {
    var shouldContinue = false;
    for (var z = 0; z < testRanges.length; z++) {
      var testRange = testRanges[z];
      shouldContinue |= (testRange[0] <= i && i <= testRange[1]);
    }
    if (!shouldContinue) continue;

    var record = records[i].toString().trim();
    if (record.length < 1) {
      continue;
    }
    var dataParts = record.split(/,/);

    var ipFrom = dataParts[0].toString().replace(/"/g, "");
    var ipTo = dataParts[1].toString().replace(/"/g, "");
    var int32From = parseInt(dataParts[2].toString().replace(/"/g, ""), 10);
    var int32To = parseInt(dataParts[3].toString().replace(/"/g, ""), 10);
    var countryCode = dataParts[4].toString().replace(/"/g, "");
    var countryName = dataParts[5].toString().replace(/"/g, "");

    var testMethodName = ("test_record_index_" + i + "_ipFrom_" + ipFrom + "_name_" + countryName);
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