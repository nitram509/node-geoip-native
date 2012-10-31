// use Node-Unit (https://github.com/caolan/nodeunit) to run this test

module.exports = {
    setUp:function (callback) {
        this.geoip = require("../../geoip.js");
        // wait until ready
        callback();
    },

    tearDown:function (callback) {
        // clean up
        callback();
    },

    test_do_warm_up:function (test) {
        function waitalittle() {
            test.done();
        }

        setTimeout(waitalittle, 3000);
    },

    test_check_if_warmed_up:function (test) {
        test.notEqual(this.geoip.lookup("127.0.0.1").code, "N/A", "No yet warmed up, please use more time for warmup");
        test.done();
    },

    test_ip_in_the_lower_range:function (test) {
        var ip;
        var actual;
        // "1.0.64.0","1.0.127.255","16793600","16809983","JP","Japan"
        ip = "1.0.64.0";
        actual = this.geoip.lookup(ip);
        test.equals(actual.name, "Japan");
        test.equals(actual.code, "JP");
        ip = "1.0.90.90";
        actual = this.geoip.lookup(ip);
        test.equals(actual.name, "Japan");
        test.equals(actual.code, "JP");
        ip = "1.0.127.255";
        actual = this.geoip.lookup(ip);
        test.equals(actual.name, "Japan");
        test.equals(actual.code, "JP");

        test.done();
    },

    test_ip_in_upper_range:function (test) {
        var ip;
        var actual;
        // "223.223.168.0","223.223.175.255","3755976704","3755978751","KH","Cambodia"
        ip = "223.223.168.0";
        actual = this.geoip.lookup(ip);
        test.equals(actual.name, "Cambodia");
        test.equals(actual.code, "KH");
        ip = "223.223.170.170";
        actual = this.geoip.lookup(ip);
        test.equals(actual.name, "Cambodia");
        test.equals(actual.code, "KH");
        ip = "223.223.175.255";
        actual = this.geoip.lookup(ip);
        test.equals(actual.name, "Cambodia");
        test.equals(actual.code, "KH");

        test.done();
    }
};