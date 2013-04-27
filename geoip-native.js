var countryNamesAndCodes = require('./generated-namesandcodes.js').countryNamesAndCodes;
var countries = require('./generated-countries.js').countries;
var countriesLength = countries.length;

module.exports = geoip = {
  lookup: function (ip) {
    return _lookup(ip);
  }
};

/**
 * @param ip the ip we're looking for
 * @return {*}
 * @see http://en.wikipedia.org/wiki/Binary_search_algorithm   (Deferred detection of equality approach)
 */
function _lookup(ip) {

  var parts = ip.split(".");
  var target_ip = parseInt(parts[3], 10) +
     (parseInt(parts[2], 10) * 256) +
     (parseInt(parts[1], 10) * 65536) +
     (parseInt(parts[0], 10) * 16777216);

  var idxMin = 0;
  var idxMiddle = 0;
  var idxMax = countriesLength - 1;

  while (idxMin < idxMax) {
    idxMiddle = (idxMax + idxMin) >> 1;
    if (!(idxMiddle < idxMax)) {
      throw "assertion error: idxMiddle is not lower then idxMax"
    }
    if (countries[idxMiddle].s < target_ip) {
      idxMin = idxMiddle + 1;
    } else {
      idxMax = idxMiddle;
    }
  }

  var pickedCountry = countries[idxMin];
  if ((idxMax == idxMin) && (pickedCountry.s == target_ip)) {
    pickedCountry = countries[idxMin];
    return createCountry(pickedCountry.s, pickedCountry.e, countryNamesAndCodes[pickedCountry.i], countryNamesAndCodes[pickedCountry.i + 1]);
  }

  if ((idxMiddle > 0) && (countries[idxMiddle - 1].s < target_ip) && (target_ip < countries[idxMiddle].s)) {
    pickedCountry = countries[idxMiddle - 1]
    return createCountry(pickedCountry.s, pickedCountry.e, countryNamesAndCodes[pickedCountry.i], countryNamesAndCodes[pickedCountry.i + 1]);
  }

  if ((idxMiddle < idxMax) && (countries[idxMiddle].s < target_ip) && (target_ip < countries[idxMiddle + 1].s)) {
    pickedCountry = countries[idxMiddle]
    return createCountry(pickedCountry.s, pickedCountry.e, countryNamesAndCodes[pickedCountry.i], countryNamesAndCodes[pickedCountry.i + 1]);
  }
  return createCountry(target_ip, target_ip, "UNKNOWN", "N/A");
}

function createCountry(ipstart, ipend, countryName, countryCode) {
  return {
    ipstart: ipstart,
    ipend: ipend,
    name: countryName,
    code: countryCode
  };
}
