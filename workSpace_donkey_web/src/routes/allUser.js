const express = require("express");
const router = express.Router();
const allUserController = require("../controllers/allUserController.js");

// POST /upload: 調用 uploadFiles控制器的功能。
// GET /files 獲取/files圖像列表。
// GET /files/:name 下載帶有文件名的圖像。
let routes = (app, fcn) => {
    app.use("/userListAdmin", (req, res, next)=>{
        console.log('in allUser');
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
    router.get("/", allUserController.getList(fcn));
    router.get("/list", allUserController.getList(fcn));
    router.get("/new", allUserController.showNewForm(fcn));
    router.post("/insert", allUserController.insert);
    router.get("/edit", allUserController.showEditForm(fcn));
    router.post("/update", allUserController.update);
    router.get("/delete", allUserController.deleted);
    return app.use("/userListAdmin", router);
};

module.exports = routes;