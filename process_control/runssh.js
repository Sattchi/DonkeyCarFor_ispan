const path = require('path');
const { NodeSSH } = require('node-ssh');

const ssh = new NodeSSH();

ssh.connect({
    // host: '192.168.52.143',
    host: '192.168.52.78',
    // host: '192.168.52.94',
    username: 'pi',
    password: "123456"
}).then(
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