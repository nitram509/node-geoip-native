var midpoints = [];
var countryNamesAndCodes = require('./generated-namesandcodes.js').countryNamesAndCodes;
var countries = require('./generated-countries.js').countries;
var countriesLength = countries.length;

module.exports = geoip = {
   lookup:function (ip) {
      return find(ip);
   }
};

/**
 * A quick little binary search
 * @param ip the ip we're looking for
 * @return {*}
 */
function find(ip) {

   var mpi = 0;
   var n = midpoints[0];
   var step;
   var parts = ip.split(".");
   var target_ip = parseInt(parts[3], 10) +
      (parseInt(parts[2], 10) * 256) +
      (parseInt(parts[1], 10) * 65536) +
      (parseInt(parts[0], 10) * 16777216);

   var current;
   var next;
   var prev;
   var nn;
   var pn;

   while (true) {

      mpi++;
      step = midpoints[mpi];
      current = countries[n];
      nn = n + 1;
      pn = n - 1;

      next = nn < countriesLength ? countries[nn] : null;
      prev = pn > -1 ? countries[pn] : null;

      // take another step?
      if (step > 0) {

         if (!next || next.ipstart < target_ip) {
            n += step;
         } else {
            n -= step;
         }

         continue;
      }

      // we're either current, next or previous depending on which is closest to target_ip
      var curr_ip_diff = Math.abs(target_ip - current.ipstart);
      var next_ip_diff = next && next.ipstart < target_ip ? target_ip - next.ipstart : 1000000000;
      var prev_ip_diff = prev && prev.ipstart <= target_ip ? target_ip - prev.ipstart : 1000000000;

      // current wins
      if (curr_ip_diff < next_ip_diff && curr_ip_diff < prev_ip_diff) {
         return {ipstart:current.ipstart, name:countryNamesAndCodes[current.idx], code:countryNamesAndCodes[current.idx + 1]};
      }

      // next wins
      if (next_ip_diff < curr_ip_diff && next_ip_diff < prev_ip_diff) {
         return {ipstart:next.ipstart, name:countryNamesAndCodes[next.idx], code:countryNamesAndCodes[next.idx + 1]};
      }

      // prev wins
      return {ipstart:prev.ipstart, name:countryNamesAndCodes[prev.idx], code:countryNamesAndCodes[prev.idx + 1]};
   }
}

/*
 prepare midpoints ....
 */
(function () {
   var n = countriesLength;
   while (n >= 1) {
      n = n >> 1;
      midpoints.push(n);
   }
})();