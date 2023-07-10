const express = require("express");
const router = express.Router();
const redirectController = require("../controllers/redirectController");

let routes = (app, [comhost, rpihost, comPort, ownPort, payPort, carPort]) => {
    router.get("/modelListUser", redirectController.modelListUser(rpihost, ownPort));
    router.get("/dataProcess", redirectController.dataProcess(rpihost, ownPort));
    router.get("/controlReal", redirectController.control(rpihost, ownPort));
    router.get("/controlVirtual", redirectController.control(comhost, ownPort));
    router.get("/pay", redirectController.pay(comhost, payPort));
    return app.use("/", router);
};

module.exports = routes;