var express = require('express');
var io = require('socket.io');
var spawn = require('child_process').spawn;
var app = express();

app.use(express.static("www"));

var server = app.listen(5438, function () {
    console.log('伺服器在5438埠口開工了。');
});

// const fileNames = ["runForever1.py", "runForever2.py"]
const fileNames = ["game_maze.py", "game_snake.py", "runForever.py", "runForever1.py", "runForever2.py"]
const fileParas = [undefined, undefined, undefined, undefined, ["abc", "eq"]];
const fileOptions = [undefined, undefined, { cwd: "/home/pi/workspace_nodejs/process_control" }, undefined, undefined];
const fileChins = ["迷宮", "貪吃蛇", "永恆", "永恆1", "永恆2"];

var sio = io.listen(server);
var subprocess = null;

sio.on('connection', function (socket) {
    socket.emit("fileUpload", fileChins);

    socket.on('disconnect', function () {
        console.log('Bye, bye!');
        stopProcess();
        process.exit();
    });
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
    const fileName = fileNames[num];
    const filePara = fileParas[num];
    const para = (!filePara) ? [fileName] : [fileName].concat(filePara);
    const fileOption = fileOptions[num];
    console.log("想執行 Python 檔案: " + fileName);
    console.log("必選參數: " + para);
    console.log("可選參數: ");
    console.log(fileOption);
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