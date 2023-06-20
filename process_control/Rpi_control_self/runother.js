console.log("進來 js 了");
const exec = require('child_process').exec;
const cmd = 'python runForever.py';
function dosomething() {
    console.log("正在執行程式碼");
    const subprocess = exec(cmd, function (error, stdout, stderr) {
        console.log("exec...");
        if (error != null) {
            console.log("執行失敗!" + error);
            throw error;
        } else {
            console.log("執行成功!");
            console.log("標準輸出:\n" + stdout);
            console.log("錯誤輸出:\n" + stderr);
        }
    });
    console.log("非同步!");
    console.log(`Spawned child pid: ${subprocess.pid}`);
    subprocess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    subprocess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    subprocess.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });
    setTimeout(function () {
        subprocess.kill('SIGINT');
        // subprocess.kill('SIGTERM');
        // subprocess.kill('SIGKILL');
        console.log("成功停止程序");
    }, 5000);
    // console.log(subprocess);
}
dosomething();