// 檔案讀取
const fs = require("fs");

// 載入express模組
const express = require('express');
// 使用express
const app = express();

// 解析器
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

// EJS 核心
const engine = require("ejs-locals");
app.engine("ejs", engine);
// 讀取 EJS 檔案位置
app.set('views', './views');
// 用 EJS 引擎跑模板
app.set("view engine", "ejs");

// 調用靜態資料夾檔案
app.use(express.static(__dirname + '/www'));

// socket.io 連結一切
const io = require('socket.io');

// 子程序模組
const spawn = require('child_process').spawn;

// const fileNames = ["runForever1.py", "runForever2.py"]
// const fileNames = ["manage.py", "manage.py", "manage.py", "manage.py", "manage.py", "manage.py", "manage.py"]
// const fileParas = [["drive", "--model", "./models/mypilot_forward_only.h5"],
// ["drive", "--model", "./models/mypilot_backward.h5"],
// ["drive", "--model", "./models/mypilot_reverse.h5"],
// ["drive", "--model", "./models/mypilot_backward_reverse.h5"],
// ["drive", "--model", "./models/mypilot_yellow_3800.h5"],
// ["drive", "--model", "./models/mypilot_yellow_6500.h5"],
// ["drive", "--model", "./models/mypilot_forward_only.h5"]];
// const fileOptions = [{ cwd: "/home/pi/mycar2" }, { cwd: "/home/pi/mycar2" }, { cwd: "/home/pi/mycar2" }, { cwd: "/home/pi/mycar2" }, { cwd: "/home/pi/mycar2" }, { cwd: "/home/pi/mycar2" }, { cwd: "/home/pi/mycar2" }];
// const fileChins = ["順時針前進", "順時針倒車","逆時針前進", "逆時針倒車", "路邊停車3800", "路邊停車6500"];


function readTextFile(file, callback) {
    fs.readFile(file, function (err, text) {
        callback(text);
    });
}

readTextFile("www/json/autoModel.json", function(text){
    modelData = JSON.parse(text);
    console.log(modelData);
    fileChins = Object.values(modelData).map(item => item.chinName);
});

const newfileChins = []
while (fileChins.length){
    newfileChins.push(fileChins.splice(0,3))
}
console.log(newfileChins)

// 查看用戶代理IP
// app.use(function (req, res, next){
//     console.log("用戶IP位址: "+req.connection.remoteAddress);
//     console.log("用戶IP位址: "+(req.connection || req.socket || req).remoteAddress);
//     next();
// });

app.get("/", function (req, res, next) {
    res.render('index', { "title": "控制台", "fileChins": newfileChins });
});


// 路由控制
port = 6543;
host = "127.0.0.1";
var server = app.listen(port, function () {
    console.log(`伺服器在${port}埠口開工了。`);
    console.log(`http://${host}:${port}/`);
});


var sio = io.listen(server);
var subprocess = null;

sio.on('connection', function (socket) {
    // socket.emit("fileUpload", fileChins);
    // socket.on('disconnect', function () {
    //     console.log('Bye, bye!');
    //     stopProcess();
    //     process.exit();
    // });
    socket.on('prc', function (num) {
        doProcess(num)
    });
    socket.on("stop", function () {
        stopProcess();
    });
    socket.on("exit", function () {
        stopProcess();
        process.exit();
    });
});

process.on("exit", function () {
    stopProcess();
});

function doProcess(num) {
    stopProcess();
    // const fileName = fileNames[num];
    // const filePara = fileParas[num];
    // const para = (!filePara) ? [fileName] : [fileName].concat(filePara);
    // const fileOption = fileOptions[num];
    const fileName = modelData[num].fileName;
    const filePara = modelData[num].para;
    const para = (!filePara) ? [fileName] : [fileName].concat(filePara);
    const fileOption = modelData[num].option;
    console.log("想執行 Python 檔案: " + fileName);
    console.log("必選參數: " + para);
    console.log("可選參數: ");
    console.log(fileOption);
    // python manage.py drive --model ~/mycar2/models/mypilot.h5 
    subprocess = spawn("python", para, fileOption);
    console.log("非同步!");
    console.log(`Spawned child pid: ${subprocess.pid}`);
    console.log("已經執行 Python 檔案: " + fileName);
    subprocess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    subprocess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    subprocess.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });
    // setTimeout(function () {
    //     subprocess.kill('SIGINT');
    //     console.log("成功停止程序");
    // }, 5000);
    // console.log(subprocess);
}

function stopProcess() {
    if (subprocess) {
        // console.log(subprocess.connected);
        console.log("停止程式!");
        // subprocess.kill('SIGINT'); // ctrl+c -2
        subprocess.kill('SIGTERM'); // -15
        // subprocess.kill('SIGKILL'); // -9
        // subprocess = null;
    }
}