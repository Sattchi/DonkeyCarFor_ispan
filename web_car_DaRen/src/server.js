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
app.set('views', __dirname + '/views');
// 用 EJS 引擎跑模板
app.set("view engine", "ejs");

// 調用靜態資料夾檔案
app.use(express.static(__dirname + '/www'));

// socket.io 連結一切
const io = require('socket.io');

// 子程序模組
const spawn = require('child_process').spawn;
const exec = require('child_process').exec;

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


// function readTextFile(file, callback) {
//     fs.readFile(file, function (err, text) {
//         callback(text);
//     });
// }
// const newfileChins = []

// readTextFile("./www/json/autoModel.json", function (text) {
//     modelData = JSON.parse(text);
//     console.log(modelData);
//     var fileChins = Object.values(modelData).map(item => item.chinName);
//     while (fileChins.length) {
//         newfileChins.push(fileChins.splice(0, 3))
//     }
//     console.log(newfileChins)
// });

const joystick = require('./config/joystick');

const modelData = require('./config/autoModel');
console.log(modelData);
// const fileChins = Object.values(modelData).map(item => item.chinName);
const fileChins = modelData.map(item => item.chinName);
const newfileChins = [];
while (fileChins.length) {
    newfileChins.push(fileChins.splice(0, 3))
}
console.log(newfileChins)

// 查看用戶代理IP
// app.use(function (req, res, next){
//     console.log("用戶IP位址: "+req.connection.remoteAddress);
//     console.log("用戶IP位址: "+(req.connection || req.socket || req).remoteAddress);
//     next();
// });

app.get('/', function (req, res) {
    /*
    res.cookie('name', 'lulu', {
        maxAge: 10000, // 只存在n秒，n秒後自動消失
        httpOnly: true // 僅限後端存取，無法使用前端document.cookie取得
    })*/
    res.redirect('http://127.0.0.1:3000')

    //console.log(req.cookies);
    //console.log(req.cookies.name); //找單個cookies
});

app.get("/control", function (req, res) {
    res.render('control', {
        "title": "控制台",
        "joyChin": joystick.chinName,
        "fileChins": newfileChins,
        "baseUrl": "http://192.168.52.94:6543",
        "carWeb": "http://192.168.52.94:8887"
    });
});

app.get("/control_ori", function (req, res) {
    res.render('control_ori', {
        "title": "控制台",
        "fileChins": newfileChins,
        "carWeb": "http://127.0.0.1:8887/drive"
    });
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
        if (num == -1) {
            // console.log(num);
            // console.log(joystick);
            doProcess(joystick);
        } else if ((num >= 0) & (num < modelData.length)) {
            // console.log(num);
            // console.log(modelData[num]);
            doProcess(modelData[num]);
        } else {
            console.log('模有這個編號');
        }
        
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

function doProcess(obj) {
    stopProcess();
    // const fileName = fileNames[num];
    // const filePara = fileParas[num];
    // const para = (!filePara) ? [fileName] : [fileName].concat(filePara);
    // const fileOption = fileOptions[num];
    console.log(process.argv)
    if (process.argv[2] != '1') {
        const fileName = obj.fileName;
        const filePara = obj.para;
        const para = (!filePara) ? [fileName] : [fileName].concat(filePara);
        const fileOption = obj.option;
        console.log("想執行 Python 檔案: " + fileName);
        console.log("必選參數: " + para);
        console.log("可選參數: ");
        console.log(fileOption);
        // // python manage.py drive --model ~/mycar2/models/mypilot.h5
        subprocess = spawn("python", para, fileOption);
        console.log("非同步!");
        console.log(`Spawned child pid: ${subprocess.pid}`);
        console.log("已經執行 Python 檔案: " + fileName);
    } else {
        const commands = ['conda activate donkey', 'python C:\\workspace_final\\mysim\\manage.py drive --model C:\\workspace_final\\mysim\\models\\mypilot_forward_only.h5 --myconfig ./myconfig1.py']
        subprocess = exec(commands.join(' & '))
    }

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