const path = require('path');
const { NodeSSH } = require('node-ssh');

const ssh = new NodeSSH();

ssh.connect({
    // host: '192.168.52.143',
    host: '192.168.52.78',
    // host: '192.168.52.94',
    username: 'pi',
    password: "123456"
}).then(function () {
    setTimeout(() => { ssh.execCommand("kill -TERM $(ps -aux | grep python | grep runForever.py | awk '{print $2}')") }, 20000);
    ssh.exec("python", ["/home/pi/workspace_nodejs/process_control/runForever.py"], { stream: 'stdout', options: { pty: true } }).then(function (result) {
        console.log('STDOUT: ' + result);

    });
});
