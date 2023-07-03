const util = require("util");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const dbConfig = require("../config/fileDB");

// 這裡我們定義一個 storage 的配置對象 GridFsStorage
var storage = new GridFsStorage({
    // url: 必須是指向 MongoDB 數據庫的標準 MongoDB 連接字符串。 multer-gridfs-storage 模塊將自動為您創建一個 mongodb 連接。
    url: dbConfig.url + dbConfig.database,
    // options: 自定義如何建立連接
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    // file: 這是控制數據庫中文件存儲的功能。該函數的返回值是一個具有以下屬性的對象：filename, metadata, chunkSize, bucketName, contentType... 
    file: (req, file) => {
        const match = ["image/png", "image/jpeg", "image/gif", "application/octet-stream"];
        // 我們還檢查文件是否為圖像 file.mimetype。
        if (match.indexOf(file.mimetype) === -1) {
            const filename = `${Date.now()}-zhijianqiu-${file.originalname}`;
            return filename;
        }
        return {
            // bucketName 表示文件將存儲在 photos.chunks 和 photos.files 集合中。photos 是資料表的名稱
            bucketName: dbConfig.filesBucket,
            filename: `${Date.now()}-zhijianqiu-${file.originalname}`
        };
    }
});
const maxSize = 15 * 1024 * 1024;
// 接下來我們使用 multer 模塊來初始化中間件 util.promisify() 並使導出的中間件對象可以與 async-await.
// single() 帶參數的函數是 input 標籤的名稱
// 這裡使用 Multer API 來限制上傳文件大小，添加 limits: { fileSize: maxSize } 以限製文件大小
var uploadFiles = multer({ storage: storage, limits: { fileSize: maxSize } }).single("file");
var uploadFilesMiddleware = util.promisify(uploadFiles);
module.exports = uploadFilesMiddleware;