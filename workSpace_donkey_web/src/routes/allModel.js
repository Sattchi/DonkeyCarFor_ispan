const express = require("express");
const router = express.Router();
const allModelController = require("../controllers/allModelController.js");

// POST /upload: 調用 uploadFiles控制器的功能。
// GET /files 獲取/files圖像列表。
// GET /files/:name 下載帶有文件名的圖像。
let routes = (app, fcn) => {
    router.get("/", allModelController.getListFiles(fcn));
    router.get("/list", allModelController.getListFiles(fcn));
    router.post("/upload", allModelController.uploadFiles);
    router.get("/files", allModelController.getListFiles(fcn));
    router.get("/files/:name", allModelController.download);
    router.get("/delete/:name", allModelController.deleted);
    app.use("/modelList", router);
    return app.use("/modelListAdmin", router);
};

module.exports = routes;