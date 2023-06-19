var express = require('express');
var io = require('socket.io');
var spawn = require('child_process').spawn;
var app = express();

app.use(express.static("www"));

var server = app.listen(5438, function () {
    console.log('伺服器在5438埠口開工了。');
});

const file = ["runForever1.py", "runForever2.py"]
// const file = ["game_maze.py", "game_snake.py", "runForever1.py", "runForever2.py"]
const filePara = [[], [], [], []];
const fileChin = ["迷宮", "貪吃蛇", "永恆1", "永恆2"];

var sio = io.listen(server);
var subprocess = null;

sio.on('connection', function (socket) {
    socket.emit("file", file);

    socket.on('disconnect', function () {
        console.log('Bye, bye!');
        stopProcess();
        process.exit();
    });

    socket.on('prc1', function () {
        doProcess(file[0]);
    });
    socket.on('prc2', function () {
        doProcess(file[1]);
    });
    socket.on('prcS', function (fileName) {
        doProcess(fileName);
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

function doProcess(fileName) {
    stopProcess();
    console.log("想執行 Python 檔案: " + fileName);
    subprocess = spawn("python", [fileName]);
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
        subprocess.kill('SIGINT');
        // subprocess.kill('SIGTERM');
        // subprocess = null;
    }
}