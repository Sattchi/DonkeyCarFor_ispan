const express = require("express");
const router = express.Router();
const allCardController = require("../controllers/allCardController.js");
const upload = require("../middleware/uploadcard.js");

// POST /upload: 調用 uploadFiles控制器的功能。
// GET /files 獲取/files圖像列表。
// GET /files/:name 下載帶有文件名的圖像。
let routes = (app, fcn) => {
    app.use("/cardListAdmin", (req, res, next)=>{
        console.log('in allCard');
        console.log('req.originalUrl: ' + req.originalUrl);
        console.log('req.baseUrl: ' + req.baseUrl);
        console.log('req.path: ' + req.path);
        console.log('req.url: ' + req.url);

        if (typeof req.cookies.auth === 'undefined' || req.cookies.auth === 'visitor' || req.cookies.auth === 'user') {
            console.log('allUser auth not enough')
            // return res.status(403).send({ message: "權限不足" })
            return res.status(403).redirect('/?warning=用戶權限不足')
        }
        next()
    })
    router.get("/", allCardController.getList(fcn));
    router.get("/list", allCardController.getList(fcn));
    router.post("/upload", allCardController.uploadFiles);
    router.get("/files/:id", allCardController.download);
    router.get("/new", allCardController.showNewForm(fcn));
    router.post("/insert", allCardController.insert);
    /* 
     * body-parser 中間件無法處理 multipart bodies，包含 enctype="multipart/form-data" 的表單
     * req.body 會是空物件
     * 
     * 也就是說，這時候我們需要新的中間件處理，官網 (https://github.com/expressjs/body-parser)給出了幾個建議
     * busboy and connect-busboy
     * multiparty and connect-multiparty
     * formidable
     * multer
     * express-uploader
     * 這裡我們選用 multer
     */
    router.get("/edit", allCardController.showEditForm(fcn));
    router.post("/update", allCardController.update);
    router.get("/delete", allCardController.deleted);
    app.use("/cardList", router);
    return app.use("/cardListAdmin", router);
};

module.exports = routes;