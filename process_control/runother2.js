console.log("進來 js 了");
const spawn = require('child_process').spawn;

function dosomething() {
    console.log("正在執行程式碼");
    const subprocess = spawn("python", ["runForever.py"]);
    console.log("非同步!");
    console.log(`Spawned child pid: ${subprocess.pid}`);
    subprocess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    subprocess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    subprocess.on('close', (code, signal) => {
        console.log(`child process close with code ${code} and signal ${signal}`);
    });
    subprocess.on('exit', (code, signal) => {
        console.log(`child process exited with code ${code} and signal ${signal}`);
    });
    setTimeout(function () {
        // subprocess.kill();
        subprocess.kill('SIGINT');
        // subprocess.kill('SIGTERM');
        // subprocess.kill('SIGKILL');
        console.log("成功停止程序");
    }, 5000);
    // console.log(subprocess);
}
dosomething();