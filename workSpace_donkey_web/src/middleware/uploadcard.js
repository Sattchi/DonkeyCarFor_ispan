const util = require("util");
const multer = require('multer');

// 初始化設定
const upload = multer({
    storage: multer.memoryStorage(), // 存在記憶體 可以有更多操作
    limits: {
        fileSize: 2 * 1024 * 1024,  // 限制 2 MB
    },
    fileFilter(req, file, callback) { 
        const match = ["image/png", "image/jpeg"];
        console.log('uploadcard 有執行')
        
        // 限制檔案格式為 image
        // if (!file.mimetype.match(/^image/)) {

        // 限制檔案格式為 "image/png", "image/jpeg"
        if (match.indexOf(file.mimetype) === -1) {
            console.log('uploadcard 檔案格式錯誤')
            callback(new Error().message = '檔案格式錯誤');
        } else {
            console.log('uploadcard 檔案格式正確')
            callback(null, true);
        }
    }
});

var uploadFilesMiddleware = util.promisify(upload.single('car_img')); // multer.single() 裡放的字串必須是表單中 input[type="file"] 的 name 屬性，或是 FormData.append(name,value) 中的 name 參數，multer 才會知道要處理誰
module.exports = uploadFilesMiddleware;