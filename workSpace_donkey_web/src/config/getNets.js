const netData = require("./net.json")
module.exports = function (options) {
    let comhost;
    let rpihost;
    let comPort = "3000";
    let ownPort;
    let payPort = "3020";
    let carPort;

    if (options.web === "0" || options.web === "302" || options.web.toUpperCase() === "F3" || options.web.toUpperCase() === "C302") {
        comhost = netData["0"].com1.host;
        rpihost = netData["0"].car1.host;
        ownPort = netData["0"].car1.ownPort;
        carPort = netData["0"].car1.carPort;
    } else if (options.web === "1" || options.web.toUpperCase() === "F15") {
        comhost = netData["1"].com1.host;
        rpihost = netData["1"].car1.host;
        ownPort = netData["1"].car1.ownPort;
        carPort = netData["1"].car1.carPort;
    } else if (options.web === "2") {
        comhost = netData["2"].com1.host;
        rpihost = netData["2"].car1.host;
        ownPort = netData["2"].car1.ownPort;
        carPort = netData["2"].car1.carPort;
    } else {
        comhost = netData["0"].com1.host;
        rpihost = netData["0"].car1.host;
        ownPort = netData["0"].car1.ownPort;
        carPort = netData["0"].car1.carPort;
    }

    if (options.setHost) {
        comhost = options.setHost
        rpihost = options.setHost
        ownPort = "6543"
        carPort = "8887"
    }

    if (options.setownPort || options.setcarPort) {
        ownPort = options.setownPort || "6543"
        carPort = options.setcarPort || "8887"
    }

    return [comhost, rpihost, comPort, ownPort, payPort, carPort];
}