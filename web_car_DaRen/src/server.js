// 顯示 PID
console.log(`process id: ${process.pid}`);
console.log(`parent process id: ${process.ppid}`);

// 檔案讀取
const fs = require("fs");

const options = require('minimist')(process.argv.slice(2));
console.log(options)

const helpNote = `
Usage: server [options]

Options:
  -V, --version            output the version number
  1                        this program runs on computer (default: runs on rpi in car)
  -w <place>               choose the place of computer (choices: "0", "F3", "f3", "302", "C302", "c302", "1", "F15", "f15", "2", "home", "HOME", "h", "H", "Home", default: 302 wifi)
  -b <name>                choose whose cellphone open wireless base station (choices: "Jack", "jack", "HanChung", "Ben", "ben", "HuYen", "Jason", "jason", "DaRen")
  -u <name>                choose computer owner (choices: "Jack", "jack", "HanChung", "Ben", "ben", "HuYen", "Jason", "jason", "DaRen", default: HanChung)
  -d                       if computer is desktop
  -i <IP>                  set the IP of computer (default: 192.168.52.83)
  -r <IP>                  set the IP of rpi in car (default: 192.168.52.94)
  -c <port>                set the port of main website (default: 3000)
  -o <port>                set the port of control website (default: 6543)
  -k <port>                set the port of donkeycar website (default: 8887)
  -s <key>                 use your own setting
  -h, --help               display help for command
`
if (options.h || options.help) {
    console.log(helpNote)
    process.exit()
}

const version = '2.1.1'
if (options.V || options.v || options.version) {
    console.log(version)
    process.exit()
}

// 取得 電腦、樹梅 IP 主網、個人、停車 port
const [comhost, rpihost, comPort, ownPort, payPort, carPort] = require('./config/getNets')(options);
// console.log([comhost, rpihost, comPort, ownPort, payPort, carPort])

// 個人網站是由 電腦架設 還是 rpi架設
const useCom = options._[0] == 1
console.log(`use computer ${useCom}`)

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
const app = express();

// 解析器
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

// 使用 cookie-parser
const cookieParser = require('cookie-parser');
app.use(cookieParser('123456789'));// sign for cookie

// 使用 ejs-locals 核心
const engine = require("ejs-locals");
app.engine("ejs", engine);
// 讀取 EJS 檔案位置
app.set('views', __dirname + '/views');
// 用 EJS 引擎跑模板
app.set("view engine", "ejs");

// 調用靜態資料夾檔案
app.use(express.static(__dirname + '/www'));

// 查看用戶代理IP
// app.use(function (req, res, next){
//     console.log("用戶IP位址: "+req.connection.remoteAddress);
//     console.log("用戶IP位址: "+(req.connection || req.socket || req).remoteAddress);
//     next();
// });

// 延長 cookie 時限
app.use((req, res, next) => {
    console.log('req.originalUrl: ' + req.originalUrl);
    console.log('req.baseUrl: ' + req.baseUrl);
    console.log('req.path: ' + req.path);
    console.log('req.url: ' + req.url);
    console.log(req.cookies) // cookie 無法跨越網域
    // if (typeof req.cookies.auth === 'undefined' || req.cookies.auth === 'visitor') {
    //     console.log('死在跳轉後')
    //     return res.redirect(`http://${comhost}:${comPort}?warning=用戶方可使用個人網站<br>\\n請先登入`)
    // }
    if (req.cookies.auth === "user") {
        // req.cookies.auth.maxAge = 5*60*1000
        res.cookie('name', req.cookies.name,{
            maxAge: 5*60*1000,
            httpOnly: true,
        })
        res.cookie('auth', req.cookies.auth,{
            maxAge: 5*60*1000,
            httpOnly: true,
        })
    }
    next()
})

// 路由控制
// 根目錄的
const initRoutes = require("./routes/index");
initRoutes(app, getTocByAuth, (useCom)?comhost:rpihost, carPort);

// // 個人模型列表的
// const ownModelRoutes = require("./routes/ownModel");
// ownModelRoutes(app, getTocByAuth);

// // 資料處理的
// const dataProcessRoutes = require("./routes/dataProcess");
// ownModelRoutes(app, getTocByAuth);

// 跳轉的
const redirectRoutes = require("./routes/redirect");
redirectRoutes(app, [comhost, rpihost, comPort, ownPort, payPort, carPort]);

host = (useCom)?"127.0.0.1":rpihost;
port = ownPort;
const server = app.listen(port, function () {
    console.log(`個人網站在${port}埠口開工了。`);
    console.log(`http://${host}:${port}/`);
});

// socket 部分
require('./controllers/socketBind')(server, useCom)