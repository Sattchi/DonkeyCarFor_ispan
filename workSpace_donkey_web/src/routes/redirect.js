const express = require("express");
const router = express.Router();
const redirectController = require("../controllers/redirectController");

let routes = (app, [comhost, rpihost, comPort, ownPort, payPort, carPort]) => {
    router.get("/real", redirectController(rpihost, ownPort, "control"));
    router.get("/virtual", redirectController(comhost, ownPort, "control"));
    router.get("/pay", redirectController(comhost, payPort, ""));
    return app.use("/", router);
};

module.exports = routes;