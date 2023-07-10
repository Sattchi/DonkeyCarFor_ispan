const upload = require("../middleware/upload");
const dbConfig = require("../config/fileDB");

const MongoClient = require("mongodb").MongoClient;
const GridFSBucket = require("mongodb").GridFSBucket;

const url = dbConfig.url;
// console.log(url);

const baseUrl = "http://localhost:3000/modelList/files/";

const mongoClient = new MongoClient(url);
// console.log(mongoClient)

const uploadFiles = async (req, res) => {
    console.log('req.originalUrl: ' + req.originalUrl);
    console.log('req.baseUrl: ' + req.baseUrl);
    console.log('req.path: ' + req.path);
    console.log('req.url: ' + req.url);
    if (typeof req.cookies.auth === 'undefined' || req.cookies.auth === 'visitor' || req.cookies.auth === 'user') {
        return res.status(403).send({ message: "權限不足" })
    }
    try {
        // 使用 upload 中間件函數 處理上傳的文件
        await upload(req, res);
        if (req.file == undefined) {
            return res.status(400).send({ message: "請選擇要上傳的文件" });
        }
        return res.status(200).send({
            message: "文件上傳成功" + req.file.originalname,
        });
    } catch (error) {
        // 使用 Multer 捕獲相關錯誤
        console.log(error);
        if (error.code == "LIMIT_FILE_SIZE") {
            return res.status(500).send({
                message: "文件大小不能超過 2MB",
            });
        }
        return res.status(500).send({
            message: `無法上傳文件:, ${error}`
        });
    }
};

// getListFiles: 函數主要是獲取 photos.files,返回 url， name
const getListFiles = (fcn) => {
    return async (req, res) => {
        console.log('req.originalUrl: ' + req.originalUrl);
        console.log('req.baseUrl: ' + req.baseUrl);
        console.log('req.path: ' + req.path);
        console.log('req.url: ' + req.url);
        try {
            await mongoClient.connect();

            const database = mongoClient.db(dbConfig.database);
            const files = database.collection(dbConfig.filesBucket + ".files");
            let fileInfos = [];

            if ((await files.estimatedDocumentCount()) === 0) {
                fileInfos = []
            }

            let cursor = files.find({})
            await cursor.forEach((doc) => {
                fileInfos.push({
                    fileId: doc._id,
                    name: doc.filename,
                    // url: baseUrl + doc.filename,
                    length: doc.length,
                    chunkSize: doc.chunkSize,
                    uploadDate: doc.uploadDate,
                    contentType: doc.contentType
                });
            });

            const auth = req.cookies.auth || 'visitor'
            const renderOption = {
                'title': '大家的模型',
                'username': req.cookies.name || '訪客',
                'auth': auth,
                'baseUrl': req.baseUrl,
                'listModels': fileInfos,
                'toc': fcn(auth)
            }

            if (req.baseUrl.indexOf('Admin') >= 0 && (auth === 'root' || auth === 'admin')) {
                renderOption["title"] = '模型管理頁'
                renderOption['pageKey'] = 'models'
                return res.status(200).render('modelListAdmin', renderOption)
            } else {
                renderOption["title"] = '大家的模型'
                renderOption['pageKey'] = 'all'
                return res.status(200).render('modelList', renderOption)
            }

            // console.log(fileInfos);

            // if (req.accepts('json')) {
            //     return res.status(200).send(fileInfos);
            //   } else {
            // return res.status(200).render((req.baseUrl.indexOf('Admin') < 0) ? 'modelList' : 'modelListAdmin', {
            //     'title': '自駕模型列表',
            //     'username': req.cookie.name,
            //     'auth': req.cookie.auth,
            //     'baseUrl': req.baseUrl,
            //     'listModels': fileInfos,
            // });
            //   };
        } catch (error) {
            return res.status(500).send({
                message: error.message,
            });
        }
    };
}

// download(): 接收文件 name 作為輸入參數，從 mongodb 內置打開下載流 GridFSBucket，然後 response.write(chunk) API 將文件傳輸到客戶端。
const download = async (req, res) => {
    if (typeof req.cookies.auth === 'undefined' || req.cookies.auth === 'visitor') {
        return res.status(403).send({ message: "訪客權限不足" })
    }
    try {
        await mongoClient.connect();
        const database = mongoClient.db(dbConfig.database);
        const bucket = new GridFSBucket(database, {
            bucketName: dbConfig.filesBucket,
        });

        let downloadStream = bucket.openDownloadStreamByName(req.params.name);
        downloadStream.on("data", function (data) {
            return res.status(200).write(data);
        });

        downloadStream.on("error", function (err) {
            return res.status(404).send({ message: "無法獲取文件" });
        });

        downloadStream.on("end", () => {
            return res.end();
        });
    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }
};

module.exports = {
    uploadFiles,
    getListFiles,
    download,
};