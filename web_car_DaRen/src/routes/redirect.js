const express = require("express");
const router = express.Router();
const redirectController = require("../controllers/redirectController.js");

let routes = (app, [comhost, rpihost, comPort, ownPort, payPort, carPort]) => {
    router.get("/back", redirectController(comhost, comPort, ""));
    router.get("/resign", redirectController(comhost, comPort, "resign"));
    router.get("/login", redirectController(comhost, comPort, "login"));
    router.get("/logout", redirectController(comhost, comPort, "logout"));
    router.get("/modelList", redirectController(comhost, comPort, "modelList"));
    router.get("/pay", redirectController(comhost, payPort, ""));
    return app.use("/", router);
};

module.exports = routes;