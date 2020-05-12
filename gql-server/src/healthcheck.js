var http = require("http");
let logger = require("../build/util/logger").default;

const start = Date.now();

logger = logger.child({
  start: start,
  uid: "healthcheck",
});

var options = {
    host : "localhost",
    path: '/v1/health',
    port : "4000",
    timeout : 2000
};

var request = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    if (res.statusCode == 200) {
        logger.child({
            ms: Date.now() - start,
            success: true,
        }).info("success");
        process.exit(0);
    } else {
        logger.child({
            ms: Date.now() - start,
            success: false,
        }).error(new Error(`/health returned non 200 status code ${res.statusCode}`));
        process.exit(1);
    }
});

request.on('error', function(err) {
    logger.child({
        ms: Date.now() - start,
        success: false,
    }).error(err);
    process.exit(1);
});

request.end();
