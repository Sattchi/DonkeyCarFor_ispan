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

// 取得參數
// console.log(program.options);
console.log(program.opts());
// console.log(program.getOptionValue('web'));
const options = program.opts();
// 取得 電腦、樹梅 IP 主網、個人、停車 port
const [comhost, rpihost, comPort, ownPort, payPort, carPort] = require('./config/getNets')(options);
console.log([comhost, rpihost, comPort, ownPort, payPort, carPort])

const tocElemnt = require("./config/getTOCs")()
// console.log("control    url: " + ctrWeb);
// console.log("donkey car url: " + carWeb);
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
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

//使用session
var cookieParser = require('cookie-parser');
app.use(cookieParser('123456789'));// sign for cookie

//使用ejs
let engine = require('ejs-locals');
app.engine('ejs', engine);
// 讀取 EJS 檔案位置
app.set('views', __dirname + '/views');
// 用 EJS 引擎跑模板
app.set('view engine', 'ejs');

//調用靜態資料夾檔案
app.use(express.static(__dirname + '/www')); //Serves resources from public folder

// 路由控制
// 跟目錄的
const initRoutes = require("./routes/index");
initRoutes(app, getTocByAuth);

// 模型列表的
const allModelRoutes = require("./routes/allModel");
allModelRoutes(app, getTocByAuth);

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