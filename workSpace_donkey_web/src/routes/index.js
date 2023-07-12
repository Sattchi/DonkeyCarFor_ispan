const express = require("express");
const router = express.Router();
const baseController = require("../controllers/indexController");

let routes = (app, fcn) => {
    router.get("/", baseController.index(fcn));
    router.get("/resign", baseController.resign(fcn));
    router.get("/login", baseController.login(fcn));
    router.get("/about", baseController.about(fcn));
    router.post("/regist", baseController.regist);
    router.post("/loging", baseController.loging);
    router.get("/logout", baseController.logout);
    return app.use("/", router);
};

module.exports = routes;