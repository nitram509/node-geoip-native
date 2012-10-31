var countries = [],
	midpoints = [],
	numcountries = 0,
	ready = false;

module.exports = geoip = {
   lookup: function(ip) {
	   if(!ready) {
		   console.log("geoip warming up");
	       return {code: "N/A", name: "UNKNOWN"};
	   }
	   
	   return find(ip);
   }
};

/**
 * A qcuick little binary search
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

  while(true) {

      mpi++;
      step = midpoints[mpi];
      current = countries[n];
      nn = n + 1;
      pn = n - 1;

      next = nn < numcountries ? countries[nn] : null;
      prev = pn > -1 ? countries[pn] : null;

      // take another step?
      if(step > 0) {

          if(!next || next.ipstart < target_ip) {
              n += step;
          } else {
              n -= step;
          }

          continue;
      }

      // we're either current, next or previous depending on which is closest to target_ip
      var curr_ip_diff = Math.abs(target_ip - current.ipstart);
      var next_ip_diff = next && next.ipstart < target_ip ? target_ip - next.ipstart : 1000000000;
      var prev_ip_diff = prev && prev.ipstart < target_ip ? target_ip - prev.ipstart : 1000000000;

      // current wins
      if(curr_ip_diff < next_ip_diff && curr_ip_diff < prev_ip_diff) {
          return current;
      }

      // next wins
      if(next_ip_diff < curr_ip_diff && next_ip_diff < prev_ip_diff) {
          return next;
      }

      // prev wins
      return prev;
    }
}

/**
* Prepare the data.  This uses the standard free GeoIP CSV database 
* from MaxMind, you should be able to update it at any time by just
* overwriting GeoIPCountryWhois.csv with a new version.
*/
(function() {

    var fs = require("fs");
    var sys = require("sys");
    var stream = fs.createReadStream(__dirname + "/GeoIPCountryWhois.csv");
    var buffer = "";

    stream.addListener("data", function(data) {
        buffer += data.toString().replace(/"/g, "");
    });

    stream.addListener("end", function() {

        var entries = buffer.split("\n");

        for(var i=0; i<entries.length; i++) {
            var entry = entries[i].split(",");
            if (entry.length > 5) {
                countries.push({ipstart: parseInt(entry[2]), code: entry[4], name: entry[5].trim()});
            }
        }

        countries.sort(function(a, b) {
            return a.ipstart - b.ipstart;
        });

        numcountries = countries.length;
        var n = numcountries;
        while(n >= 1) {
            n = n >> 1;
            midpoints.push(n);
        }

		    ready = true;
    });

}());