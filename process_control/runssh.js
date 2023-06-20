const path = require('path');
const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

const para = (process.argv.length > 2) ? process.argv[2] : undefined;
console.log(para);
const connectConfig = (para === "沍諺" || para === "HuYen" || para === "huyen" || para === "hy") ? {
    host: '192.168.52.78', // 沍諺 302 wifi
    username: 'pi',
    password: "123456"
} : ((para === "達人" || para === "DaRen" || para === "daren" || para === "dr") ? {
    host: '192.168.52.94', // 達人 302 wifi
    username: 'pi',
    password: "123456"
} : {
    host: '192.168.52.143', // 漢中 302 wifi
    username: 'pi',
    password: "123456"
});
console.log(connectConfig);

const para2 = (process.argv.length > 3) ? process.argv[3] : undefined;
const need = (para2 === "Y" || para2 === "y" || para2 === "Yes" || para2 === "yes" || para2 === "T" || para2 === "True" || para2 === "true") ? true : false;

if (need) {
    ssh.connect(connectConfig).then(
        function () {
            // Local, Remote
            // ssh.putFile('/home/pi/Lab/localPath/fileName', '/home/steel/Lab/remotePath/fileName').then(function () {
            //     console.log("The File thing is done")
            // }, function (error) {
            //     console.log("Something's wrong")
            //     console.log(error)
            // })
            // ssh.execCommand('ls').then(function (result) {
            //     console.log('STDOUT: ' + result.stdout)
            //     console.log('STDERR: ' + result.stderr)
            // })
            // Putting entire directories
            const failed = []
            const successful = []
            ssh.putDirectory('/home/pi/workspace_nodejs', '/home/pi/workspace_nodejs', {
                recursive: true,
                concurrency: 10,
                // ^ WARNING: Not all servers support high concurrency
                // try a bunch of values and see what works on your server
                validate: function (itemPath) {
                    const baseName = path.basename(itemPath)
                    // return baseName.substr(0, 1) !== '.' && // do not allow dot files
                    //     baseName !== 'node_modules' // do not allow node_modules
                    return baseName.substr(0, 1) !== '.'// do not allow dot files
                },
                tick: function (localPath, remotePath, error) {
                    if (error) {
                        failed.push(localPath)
                    } else {
                        successful.push(localPath)
                    }
                }
            }).then(function (status) {
                console.log('the directory transfer was', status ? 'successful' : 'unsuccessful')
                console.log('failed transfers', failed.join(', '))
                console.log('successful transfers', successful.join(', '))
            })
        }
    );
}
