const express = require("express");
const router = express.Router();
const baseController = require("../controllers/indexController.js");

let routes = (app, fcn, thisHost, carPort) => {
    router.get("/", baseController.index(fcn));
    router.get("/control", baseController.control(fcn, thisHost, carPort, 'control'));
    // router.get("/control_ori", baseController.control(fcn, thisHost, carPort, 'control_ori'));
    return app.use("/", router);
};

module.exports = routes;