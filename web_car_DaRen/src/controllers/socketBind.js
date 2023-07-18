// 包含 joystick 和 所有模型設定
const joystick = require('../config/joystick.json');

const modelData = require('../config/autoModel.json');
console.log(modelData);
// const fileChins = Object.values(modelData).map(item => item.chinName);
const fileChins = modelData.map(item => item.chinName);
const newfileChins = [];
while (fileChins.length) {
    newfileChins.push(fileChins.splice(0, 3))
}
console.log(newfileChins)

// socket.io 連結一切
const io = require('socket.io');

// 子程序模組
const spawn = require('child_process').spawn;
const exec = require('child_process').exec;

function socketBind(server, useCom) {
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
                console.log('沒有這個模型編號');
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
        console.log(useCom)
        if (!useCom) {
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
            const commands = [
                'conda activate donkey',
                // 'python C:\\workspace_final\\mysim\\manage.py drive --model C:\\workspace_final\\mysim\\models\\mypilot_forward_only.h5 --myconfig ./myconfig1.py',
                'python C:\\Users\\ohayo\\Documents\\workspace_final\\mysim\\manage.py drive --model C:\\Users\\ohayo\\Documents\\workspace_final\\mysim\\models\\mypilot_forward_only.h5 --myconfig ./myconfigVivo1.py',
            ]
            subprocess = exec(commands.join(' & '))
            console.log("非同步!");
            console.log(`Spawned child pid: ${subprocess.pid}`);
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
}

module.exports = socketBind;