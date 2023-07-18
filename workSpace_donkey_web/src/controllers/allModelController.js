const upload = require("../middleware/upload");
const dbConfig = require("../config/fileDB");

const MongoClient = require("mongodb").MongoClient;
const GridFSBucket = require("mongodb").GridFSBucket;
const ObjectId = require("mongodb").ObjectId;

const url = dbConfig.url;
// console.log(url);

// const baseUrl = "http://localhost:3000/modelList/files/";

const mongoClient = new MongoClient(url);
// console.log(mongoClient)

const uploadFiles = async (req, res) => {
    if (typeof req.cookies.auth === 'undefined' || req.cookies.auth === 'visitor' || req.cookies.auth === 'user') {
        // return res.status(403).send({ message: "權限不足" })
        return res.status(403).redirect('/modelList?warning=用戶權限不足')
    }
    try {
        // 使用 upload 中間件函數 處理上傳的文件
        await upload(req, res);
        if (req.file == undefined) {
            return res.status(400).send({ message: "請選擇要上傳的文件" });
        }
        return res.status(200).send({
            message: "文件上傳成功: " + req.file.originalname,
        });
    } catch (error) {
        // 使用 Multer 捕獲相關錯誤
        console.log('allModelController.uploadFiles Multer 捕獲錯誤');
        console.error(error);
        if (error.code == "LIMIT_FILE_SIZE") {
            return res.status(500).send({
                message: "文件大小不能超過 15MB",
            });
        }
        return res.status(500).send({
            message: `無法上傳文件: ${error}`
        });
    }
};

// getListFiles: 函數主要是獲取 photos.files,返回 url， name
const getListFiles = (fcn) => {
    return async (req, res) => {
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
                    filelength: doc.length,
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
                'toc': fcn(auth),
                'error': req.query.error || '',
                'warning': req.query.warning || '',
                'message': req.query.message || '',
                'success': req.query.success || '',
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
        // return res.status(403).send({ message: "訪客權限不足" })
        return res.status(403).redirect('/modelList?warning=訪客權限不足')
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

const deleted = async (req, res) => {
    if (typeof req.cookies.auth === 'undefined' || req.cookies.auth === 'visitor') {
        // return res.status(403).send({ message: "訪客權限不足" })
        return res.status(403).redirect('/modelList?warning=訪客權限不足')
    }

    try {

        await mongoClient.connect();

        const database = mongoClient.db(dbConfig.database);
        const files = database.collection(dbConfig.filesBucket + ".files");
        let fileInfos = [];

        if ((await files.estimatedDocumentCount()) === 0) {
            fileInfos = []
        }

        // mongodb api 要求刪除檔案 需要 ObjectId(ID) 先依據檔名查詢檔案ID
        let cursor = files.find({ "filename": `${req.params.name}` })
        await cursor.forEach((doc) => {
            fileInfos.push({
                fileId: doc._id,
                name: doc.filename,
                // url: baseUrl + doc.filename,
                filelength: doc.length,
                chunkSize: doc.chunkSize,
                uploadDate: doc.uploadDate,
                contentType: doc.contentType
            });
        });
        // 印出結果
        console.log(fileInfos);

        // 理論上只會找到一個同名檔案
        if (fileInfos.length > 1) {
            // 找到超過一個同名檔案 錯誤
            console.error(`allModelController.deleted`)
            console.error(` find more than one file with name ${req.params.name}`);
            return res.status(500).send({
                message: `搜尋到過多同名檔案，請檢查資料庫`
            })
        }

        if (fileInfos.length == 0) {
            // 沒找到同名檔案 警告
            console.log(`allModelController.deleted`)
            console.log(` find no file with name ${req.params.name}`)
            return res.status(400).send({ message: `請選擇要上傳的文件，或檢查文件名稱` });
        }

        // 確實只找到一個同名檔案
        console.log(`allModelController.deleted`)
        console.log(` find one file with name ${req.params.name}`)

        // 嘗試刪除檔案        
        const bucket = new GridFSBucket(database, {
            bucketName: dbConfig.filesBucket,
        });

        await bucket.delete(new ObjectId(fileInfos[0].fileId))

        // 成功刪除檔案
        console.log(`allModelController.deleted`)
        console.log(` Success: deleted file with name ${req.params.name}`)
        return res.status(200).send({
            message: `文件刪除成功` + req.params.name,
        });

    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }
}

module.exports = {
    uploadFiles,
    getListFiles,
    download,
    deleted,
};