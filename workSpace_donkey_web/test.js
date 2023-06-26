// 檔案讀取
const fs = require("fs");

// 系統參數解析器
const { program, Option } = require('commander');
program.version('1.0.1')
    .addOption(new Option("-w, --web <place>", "choose the place of web").default("0", "302 wifi").choices(["0", "1", "302", "F15", "F3", "C302", "f15", "f3", "c302"]))
    .addOption(new Option("--set-host <host>", "set the host of web"))
    .addOption(new Option("-t, --set-ctrWeb <url>", "set the url of control website").conflicts(["setHost"]))
    .addOption(new Option("-c, --set-carWeb <url>", "set the url of donkeycar website").conflicts(["setHost"]))
    .parse();

// console.log(program.options);
console.log(program.opts());
// console.log(program.getOptionValue('web'));
const options = program.opts();
// console.log(options.web);
// console.log(options["web"]);
// console.log(options.setCtrWeb);
// console.log(options["setCtrWeb"]);

function readTextFile(file, callback) {
    fs.readFile(file, function (err, text) {
        callback(text);
    });
}

readTextFile("donkeyCar_html/json/net.json", function (text) {
    netData = JSON.parse(text);
    // console.log(netData);
    if (options.web === "0" || options.web === "302" || options.web.toUpperCase() === "F3" || options.web.toUpperCase() === "C302") {
        ctrWeb = netData["0"].car1.ctrWeb;
        carWeb = netData["0"].car1.carWeb;
    } else if (options.web === "1" || options.web.toUpperCase() === "F15") {
        ctrWeb = netData["1"].car1.ctrWeb;
        carWeb = netData["1"].car1.carWeb;
    } else {
        ctrWeb = netData["0"].car1.ctrWeb;
        carWeb = netData["0"].car1.carWeb;
    }
    console.log("control    url: " + ctrWeb);
    console.log("donkey car url: " + carWeb);
});

// "0","302","F3","C302","f3","c302"
// "1","F15","f15",
setTimeout(() => {
    console.log("control    url: " + ctrWeb);
    console.log("donkey car url: " + carWeb);
}, 100);
if (options.setCtrWeb || options.setCarWeb) { }