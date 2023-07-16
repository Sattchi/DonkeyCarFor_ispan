// 顯示 PID
console.log(`process id: ${process.pid}`);
console.log(`parent process id: ${process.ppid}`);

// 檔案讀取
const fs = require("fs");

// 系統參數解析器
const { program, Option } = require('commander');
program.version('2.0.1')
    .addOption(new Option("-w, --web <place>", "choose the place of computer").default("0", "302 wifi").choices(["0", "F3", "f3", "302", "C302", "c302", "1", "F15", "f15", "2", "home", "HOME", "h", "H", "Home"]))
    .addOption(new Option("-b, --cell <name>", "choose whose cellphone open wireless base station").choices(["Jack", "jack", "HanChung", "Ben", "ben", "HuYen", "Jason", "jason", "DaRen"]).implies({ "web": "f15" }))
    .addOption(new Option("-u, --user <name>", "choose computer owner").default("Jack", "HanChung").choices(["Jack", "jack", "HanChung", "Ben", "ben", "HuYen", "Jason", "jason", "DaRen"]))
    .addOption(new Option("-d, --desktop", "if computer is desktop"))
    .addOption(new Option("-i, --set-comHost <IP>", "set the IP of computer (default: 192.168.52.83)"))
    .addOption(new Option("-r, --set-rpiHost <IP>", "set the IP of rpi in car (default: 192.168.52.94)"))
    .addOption(new Option("-c, --set-comPort <port>", "set the port of main website (default: 3000)"))
    .addOption(new Option("-o, --set-ownPort <port>", "set the port of control website (default: 6543)"))
    .addOption(new Option("-k, --set-carPort <port>", "set the port of donkeycar website (default: 8887)"))
    .addOption(new Option("-s, --use-self <key>", "use your own setting").conflicts(['web', 'user', 'notebook', 'setComHost', 'setRpiHost', 'setComPort', 'setOwnPort', 'setCarPort']))
    .parse();

// 取得參數
// console.log(program.options);
console.log(program.opts());
// console.log(program.getOptionValue('web'));
const options = program.opts();
// 取得 電腦、樹梅 IP 主網、個人、停車 port
const [comhost, rpihost, comPort, ownPort, payPort, carPort] = require('./config/getNets')(options);
// console.log([comhost, rpihost, comPort, ownPort, payPort, carPort])

// 取得目錄
const tocElemnt = require("./config/getTOCs")()
console.log(tocElemnt.visitor)
const getTocByAuth = (auth) => {
    if (typeof auth !== 'undefined' && auth !== 'visitor') {
        if (auth === 'root') return tocElemnt.root;
        if (auth === 'admin') return tocElemnt.admin;
        return tocElemnt.user;
    }
    return tocElemnt.visitor
}

// 載入express模組
const express = require('express');
// 使用express
let app = express();

// 解析器
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

// 使用 cookie-parser
const cookieParser = require('cookie-parser');
app.use(cookieParser('123456789'));// sign for cookie

// 使用 ejs-locals 核心
let engine = require('ejs-locals');
app.engine('ejs', engine);
// 讀取 EJS 檔案位置
app.set('views', __dirname + '/views');
// 用 EJS 引擎跑模板
app.set('view engine', 'ejs');

// 調用靜態資料夾檔案
app.use(express.static(__dirname + '/www')); //Serves resources from public folder

// 延長 cookie 時限
app.use((req, res, next) => {
    console.log('req.originalUrl: ' + req.originalUrl);
    console.log('req.baseUrl: ' + req.baseUrl);
    console.log('req.path: ' + req.path);
    console.log('req.url: ' + req.url);

    if (req.cookies.auth === "user") {
        // req.cookies.auth.maxAge = 5*60*1000
        res.cookie('name', req.cookies.name, {
            maxAge: 5 * 60 * 1000,
        })
        res.cookie('auth', "user", {
            maxAge: 5 * 60 * 1000,
        })
    }
    next()
})

// 路由控制
// 根目錄的
const initRoutes = require("./routes/index");
initRoutes(app, getTocByAuth);

// 模型列表的
const allModelRoutes = require("./routes/allModel.js");
allModelRoutes(app, getTocByAuth);
// 用戶列表的
const allUserRoutes = require("./routes/allUser.js");
allUserRoutes(app, getTocByAuth);
// 車牌列表的
const allCardRoutes = require("./routes/allCard.js");
allCardRoutes(app, getTocByAuth);

// 跳轉的
const redirectRoutes = require("./routes/redirect");
redirectRoutes(app, [comhost, rpihost, comPort, ownPort, payPort, carPort]);

//設定port位置
host = comhost
port = comPort
// 監聽 port
app.listen(port, function () {
    console.log(`伺服器在${port}埠口開工了。`);
    console.log(`http://${host}:${port}/`);
});