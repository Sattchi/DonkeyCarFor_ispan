// 顯示 PID
console.log(`process id: ${process.pid}`);
console.log(`parent process id: ${process.ppid}`);

// 檔案讀取
var fs = require("fs");

// 系統參數解析器
const { program, Option } = require('commander');
program.version('1.0.1')
    .addOption(new Option("-w, --web <place>", "choose the place of web").default("0", "302 wifi").choices(["0", "1", "2", "302", "F15", "F3", "C302", "f15", "f3", "c302"]))
    .addOption(new Option("--set-host <host>", "set the host of web"))
    .addOption(new Option("-t, --set-ctrWeb <url>", "set the url of control website").conflicts(["setHost"]))
    .addOption(new Option("-c, --set-carWeb <url>", "set the url of donkeycar website").conflicts(["setHost"]))
    .parse();

// console.log(program.options);
console.log(program.opts());
// console.log(program.getOptionValue('web'));
const options = program.opts();

// 載入express模組
const express = require('express');
// 使用express
let app = express();

// 解析器
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

// login 狀態
var isLogin = false;
var checkLoginStatus = function (req, res) {
    isLogin = false;
};

//使用session
var cookieParser = require('cookie-parser');
app.use(cookieParser('123456789'));// sign for cookie
//app.use('/cookie', routerCookie);
//使用session
//app.use(express.cookieParser('123456789'));//記得設定key來傳遞資訊

//使用ejs
let engine = require('ejs-locals');
app.engine('ejs', engine);
// 讀取 EJS 檔案位置
app.set('views', __dirname + '/views');
// 用 EJS 引擎跑模板
app.set('view engine', 'ejs');

//調用靜態資料夾檔案
app.use(express.static(__dirname + '/www')); //Serves resources from public folder

// 額外連結設定檔部分
// function readTextFile(file, callback) {
//     fs.readFile(file, function (err, text) {
//         callback(text);
//     });
// }

// readTextFile("www/json/net.json", function (text) {
//     netData = JSON.parse(text);
//     // console.log(netData);
//     if (options.web === "0" || options.web === "302" || options.web.toUpperCase() === "F3" || options.web.toUpperCase() === "C302") {
//         ctrWeb = netData["0"].car1.ctrWeb;
//         carWeb = netData["0"].car1.carWeb;
//     } else if (options.web === "1" || options.web.toUpperCase() === "F15") {
//         ctrWeb = netData["1"].car1.ctrWeb;
//         carWeb = netData["1"].car1.carWeb;
//     } else if (options.web === "2") {
//         ctrWeb = netData["2"].car1.ctrWeb;
//         carWeb = netData["2"].car1.carWeb;
//     } else {
//         ctrWeb = netData["0"].car1.ctrWeb;
//         carWeb = netData["0"].car1.carWeb;
//     }

//     if (options.setHost) {
//         // http://192.168.52.94:6543/
//         // http://192.168.52.94:8887/drive
//         ctrWeb = "http://" + options.setHost + ":6543/"
//         carWeb = "http://" + options.setHost + ":8887/drive"
//     }
//     if (options.setCtrWeb || options.setCarWeb) {
//         ctrWeb = options.setCtrWeb
//         carWeb = options.setCarWeb
//     }
//     // console.log("control    url: " + ctrWeb);
//     // console.log("donkey car url: " + carWeb);
// });

const netData = require('./config/net')
let comhost;
let rpihost;
let ctrWeb;
let carWeb;
if (options.web === "0" || options.web === "302" || options.web.toUpperCase() === "F3" || options.web.toUpperCase() === "C302") {
    comhost = netData["0"].com1.host;
    rpihost = netData["0"].car1.host;
    ctrWeb = netData["0"].car1.ctrWeb;
    carWeb = netData["0"].car1.carWeb;
} else if (options.web === "1" || options.web.toUpperCase() === "F15") {
    comhost = netData["1"].com1.host;
    rpihost = netData["1"].car1.host;
    ctrWeb = netData["1"].car1.ctrWeb;
    carWeb = netData["1"].car1.carWeb;
} else if (options.web === "2") {
    comhost = netData["2"].com1.host;
    rpihost = netData["2"].car1.host;
    ctrWeb = netData["2"].car1.ctrWeb;
    carWeb = netData["2"].car1.carWeb;
} else {
    comhost = netData["0"].com1.host;
    rpihost = netData["0"].car1.host;
    ctrWeb = netData["0"].car1.ctrWeb;
    carWeb = netData["0"].car1.carWeb;
}

if (options.setHost) {
    // http://192.168.52.94:6543/
    // http://192.168.52.94:8887/drive
    comhost = options.setHost
    rpihost = options.setHost
    ctrWeb = "6543"
    carWeb = "8887"
}

if (options.setCtrWeb || options.setCarWeb) {
    ctrWeb = options.setCtrWeb
    carWeb = options.setCarWeb
}

const tocElemnt = require("./config/setLink")(comhost, rpihost)
// console.log("control    url: " + ctrWeb);
// console.log("donkey car url: " + carWeb);
console.log(tocElemnt.visitor)


// 資料庫部分
const dbConfig = require("./config/fileDB");

const MongoClient = require("mongodb").MongoClient;
const GridFSBucket = require("mongodb").GridFSBucket;

const url = dbConfig.url;
// console.log(url);

const baseUrl = "http://localhost:3000/modelList/files/";

const mongoClient = new MongoClient(url);
// console.log(mongoClient)

const upload = require('./middleware/upload')
const uploadFiles = async (req, res) => {
    console.log('req.originalUrl: ' + req.originalUrl);
    console.log('req.baseUrl: ' + req.baseUrl);
    console.log('req.path: ' + req.path);
    console.log('req.url: ' + req.url);
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
const getListFiles = async (req, res) => {
    console.log('req.originalUrl: ' + req.originalUrl);
    console.log('req.baseUrl: ' + req.baseUrl);
    console.log('req.path: ' + req.path);
    console.log('req.url: ' + req.url);
    try {
        // console.log('0');
        // console.log(mongoClient);
        await mongoClient.connect();
        // console.log('1');

        const database = mongoClient.db(dbConfig.database);
        const files = database.collection(dbConfig.filesBucket + ".files");
        // console.log(files);
        let fileInfos = [];

        if ((await files.estimatedDocumentCount()) === 0) {
            fileInfos = []
        }

        let cursor = files.find({})
        await cursor.forEach((doc) => {
            fileInfos.push({
                fileId: doc._id,
                name: doc.filename,
                url: baseUrl + doc.filename,
                length: doc.length,
                chunkSize: doc.chunkSize,
                uploadDate: doc.uploadDate,
                contentType: doc.contentType
            });
        });

        // console.log(fileInfos);

        // if (req.accepts('json')) {
        //     return res.status(200).send(fileInfos);
        //   } else {
        return res.status(200).render((req.baseUrl.indexOf('Admin') < 0) ? 'modelList_ori' : 'modelListAdmin_ori', {
            'title': '自駕模型列表',
            'user': false,
            'baseUrl': req.baseUrl,
            'listModels': fileInfos,
            'toc': tocElemnt.user,
            'ctrWeb': ctrWeb,
            'carWeb': carWeb
        });
        //   };
    } catch (error) {
        console.log('error');
        console.error(error);
        return res.status(500).send({
            message: error.message,
        });
    }
};

// download(): 接收文件 name 作為輸入參數，從 mongodb 內置打開下載流 GridFSBucket，然後 response.write(chunk) API 將文件傳輸到客戶端。
const download = async (req, res) => {
    // console.log('req.originalUrl: ' + req.originalUrl);
    // console.log('req.baseUrl: ' + req.baseUrl);
    // console.log('req.path: ' + req.path);
    // console.log('req.url: ' + req.url);
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

// const user0 = {name:'jack', password:'123456'}

// const getListFiles2 = async (req, res) => {
//     console.log('req.originalUrl: ' + req.originalUrl);
//     console.log('req.baseUrl: ' + req.baseUrl);
//     console.log('req.path: ' + req.path);
//     console.log('req.url: ' + req.url);
//     return getListFiles(req, res);
// }

// 查看用戶代理IP
// app.use(function (req, res, next) {
//     console.log("用戶IP位址: " + req.connection.remoteAddress);
//     console.log("用戶IP位址: " + (req.connection || req.socket || req).remoteAddress);
//     next();
// });

//路由控制
//get 控制
app.get('/', function (req, res) {
    /*
    res.cookie('name', 'lulu', {
        maxAge: 10000, // 只存在n秒，n秒後自動消失
        httpOnly: true // 僅限後端存取，無法使用前端document.cookie取得
    })*/
    console.log(req.cookies);
    console.log(req.cookies.name); //找單個cookies

    if (req.cookies.name === "root") {
        res.render('index_ori', {
            'title': '首頁',
            'titleH2': req.cookies.name,
            // 'user0': user0,
            'toc': tocElemnt.root,
            'loginStatus': isLogin, //登入狀態
            'ctrWeb': ctrWeb,
            'carWeb': carWeb
        });

    } else if (req.cookies.name === "admin") {
        res.render('index_ori', {
            'title': '首頁',
            'titleH2': req.cookies.name,
            // 'user0': user0,
            'toc': tocElemnt.admin,
            'loginStatus': isLogin, //登入狀態
            'ctrWeb': ctrWeb,
            'carWeb': carWeb
        });

    } else if (req.cookies.name) {
        res.render('index_ori', {
            'title': '首頁',
            'titleH2': req.cookies.name,
            // 'user0': user0,
            'toc': tocElemnt.user,
            'loginStatus': isLogin, //登入狀態
            'ctrWeb': ctrWeb,
            'carWeb': carWeb
        });

    } else {
        res.render('index_ori', {
            'title': '首頁',
            'titleH2': req.cookies.name,
            // 'user0': user0,
            'toc': tocElemnt.visitor,
            'loginStatus': isLogin, //登入狀態
            'ctrWeb': ctrWeb,
            'carWeb': carWeb
        });
    }
});

app.get('/user', function (req, res) {
    res.render('user', {
        'title': "使用者頁面",
        'toc': tocElemnt.user,
    });
});


app.get('/logout', function (req, res) {
    console.log('logout USER .' + req.cookies.name);
    res.clearCookie('name', { path: '/' }); //清除目標
    isLogin = false;
    res.redirect('/');
});

app.get('/resign1.html', function (req, res) {
    res.render('resign_ori', {
        'title': '註冊新人員',
        'toc': tocElemnt.visitor,
        'ctrWeb': ctrWeb,
        'carWeb': carWeb
    });
});

app.get('/login.html', function (req, res) {
    res.render('login_ori', {
        'title': '登入',
        'toc': tocElemnt.visitor,
        'ctrWeb': ctrWeb,
        'carWeb': carWeb
    });
});

app.get('/about.html', function (req, res) {
    res.render('about_ori', {
        'title': '關於',
        'toc': tocElemnt.visitor,
        'ctrWeb': ctrWeb,
        'carWeb': carWeb
    });
});

// app.use('/modelList', (req, res)=>{
//     console.log('req.originalUrl: ' + req.originalUrl);
//     console.log('req.baseUrl: ' + req.baseUrl);
//     console.log('req.path: ' + req.path);
//     console.log('req.url: ' + req.url);
//     getListFiles(req, res);
//     res.render('modelList', {
//         'title': '自駕模型列表',
//         'baseUrl': req.baseUrl,
//         'listModels': ""
//     });
// });
const router = express.Router();
router.get('/', getListFiles);
router.get('/list', getListFiles);
router.post('/upload', uploadFiles);
router.get('/files/:name', download);
router.get('/delete', getListFiles);

app.use('/modelList', router);
app.use('/modelListAdmin', router);

app.get('/control', function (req, res) {
    // console.log("control    url: " + ctrWeb);
    // console.log("donkey car url: " + carWeb);
    // res.render('control', {
    //     'title': '控制台',
    //     // 'ctrWeb': 'http://192.168.52.94:6543',
    //     // 'carWeb': 'http://192.168.52.94:8887/drive'
    //     // 'ctrWeb': netData["0"].car1.ctrWeb,
    //     // 'carWeb': netData["0"].car1.carWeb
    //     'ctrWeb': ctrWeb,
    //     'carWeb': carWeb
    // });
    res.redirect('http://192.168.32.50:6543/control')
});

//post 控制
//註冊
app.post('/regist', function (req, res) {
    var uc = req.body.uc;
    var pw = req.body.passWord;
    var cn = req.body.customName;

    var html = '帳號：' + uc + '<br>' +
        '密碼：' + pw + '<br>' + '完成註冊';
    res.send(html);

    fs.readFile(__dirname + "/www/json/" + "data.json", 'utf8', function (err, data) {
        data = JSON.parse(data); //將目標json 轉為js對象
        var arr = Object.keys(data);  //將js對象套用至object
        var length = arr.length + 1; //獲得json資料總長度arr.length console.log(arr.length);
        var newuserl = "user" + length;
        var user = { //console.log(user);
            [newuserl]: {  //將變數用作key的寫法
                "name": uc,
                "password": pw,
                "customName": cn,
                "id": length
            }
        }
        data[newuserl] = user[newuserl];
        //console.log(data[newuserl]);
        //console.log( data );
        res.end(JSON.stringify(data));
        fs.writeFile(__dirname + "/www/json/" + "data.json", JSON.stringify(data), function (err) {
            if (err)
                console.log(err);
            else
                console.log('new USER .' + uc);
        });
    });
});

//帳號登入
app.post('/login', function (req, res) {

    var uc = req.body.uc;
    var pw = req.body.passWord;
    //var cn=req.body.customName;
    /*
      var html = '帳號：' + uc + '<br>' +
                 '密碼：' + pw + '<br>'+'完成登入';*/
    res.cookie('name', uc, {
        maxAge: 100 * 1000, // 只存在n秒，n秒後自動消失
        httpOnly: false // 僅限後端存取，無法使用前端document.cookie取得
    })
    isLogin = true;
    // user0.name = uc;
    /*
    res.cookie('firstName', uc, { path: '/', signed: true, maxAge:600000});  //set cookie
    res.cookie('lastName', pw, { path: '/', signed: true, maxAge:600000 });  //set cookie
    */
    res.redirect('/');
    // res.send(html);
    console.log(' USER login:.' + uc);
});

//設定port位置
let port = 3000;
host = "127.0.0.1";
// 監聽 port
app.listen(port, function () {
    console.log(`伺服器在${port}埠口開工了。`);
    console.log(`http://${host}:${port}/`);
});