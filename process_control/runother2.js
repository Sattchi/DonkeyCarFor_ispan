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

    subprocess.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });
    setTimeout(function () {
        subprocess.kill('SIGINT');
        console.log("成功停止程序");
    }, 5000);
    // console.log(subprocess);
}
dosomething();