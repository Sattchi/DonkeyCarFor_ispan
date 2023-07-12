const netData = require("./net.json")
module.exports = function (options) {
    let comhost;
    let rpihost;
    let comPort = "3000";
    let ownPort;
    let payPort = "3020";
    let carPort;

    const place = (options.web === "0" || options.web === "302" || options.web.toUpperCase() === "F3" || options.web.toUpperCase() === "C302")?'ispan302':((options.web === "1" || options.web.toUpperCase() === "F15")?'ispan15':((options.web === "2" || options.web.toUpperCase() === "H" || options.web.toUpperCase() === "HOME" )?'home':'ispan302'))

    console.log(place)

    const name = (options.user.toUpperCase() === "JACK" || options.user.toUpperCase() === "HanChung".toUpperCase())?'Jack':((options.user.toUpperCase() === "BEN" || options.user.toUpperCase() === "HuYen".toUpperCase())?'Ben':((options.user.toUpperCase() === "JASON" || options.user.toUpperCase() === "DaRen".toUpperCase())?'Jason':'Jack'))

    console.log(name);

    const note = (options.desktop)?'':'Note'
    console.log(note);

    const key = place + name + note

    if (key in netData) {
        comhost = netData[key].com1.host;
        rpihost = netData[key].car1.host;
        ownPort = netData[key].car1.ownPort;
        carPort = netData[key].car1.carPort;
    } else {
        console.log(`沒找到鑰匙 ${key}`)
        comhost = netData["ispan302JackNote"].com1.host;
        rpihost = netData["ispan302JackNote"].car1.host;
        ownPort = netData["ispan302JackNote"].car1.ownPort;
        carPort = netData["ispan302JackNote"].car1.carPort;
    }

    if (options.setComHost) {
        comhost = options.setComHost
    }
    if (options.setRpiHost) {
        rpihost = options.setRpiHost
    }
    if (options.setComPort) {
        comPort = options.setComPort
    }
    if (options.setOwnPort) {
        ownPort = options.setOwnPort
    }
    if (options.setCarPort) {
        carPort = options.setCarPort
    }

    if (options.useSelf) {
        const selfKey = options.useSelf
        console.log(`使用自訂鑰匙 ${selfKey}`);
        if (selfKey in netData){
            comhost = netData[selfKey].com1.host;
            rpihost = netData[selfKey].car1.host;
            ownPort = netData[selfKey].car1.ownPort;
            carPort = netData[selfKey].car1.carPort;
        } else {
            console.log(`沒找到自訂鑰匙 ${selfKey}`)
        }
    }

    console.log([comhost, rpihost, comPort, ownPort, payPort, carPort]);

    return [comhost, rpihost, comPort, ownPort, payPort, carPort];
}