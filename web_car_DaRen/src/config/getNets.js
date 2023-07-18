const netData = require("./net.json")
module.exports = function (options) {
    let comhost;
    let rpihost;
    let comPort = "3000";
    let ownPort;
    let payPort = "3020";
    let carPort;

    const place = (options.w)?((options.w === "0" || options.w === "302" || options.w.toUpperCase() === "F3" || options.w.toUpperCase() === "C302")?'ispan302':((options.w === "1" || options.w.toUpperCase() === "F15")?'ispan15':((options.w === "2" || options.w.toUpperCase() === "H" || options.w.toUpperCase() === "HOME" )?'home':'ispan302'))):'ispan302'

    console.log(place)

    const cell = (options.b) ? (((options.b.toUpperCase() === "JACK" || options.b.toUpperCase() === "HanChung".toUpperCase()) ? 'Jack' : ((options.b.toUpperCase() === "BEN" || options.b.toUpperCase() === "HuYen".toUpperCase()) ? 'Ben' : ((options.b.toUpperCase() === "JASON" || options.b.toUpperCase() === "DaRen".toUpperCase()) ? 'Jason' : 'Jack'))) + 'Cell') : ''

    console.log(cell)

    const name = (options.u)?((options.u.toUpperCase() === "JACK" || options.u.toUpperCase() === "HanChung".toUpperCase())?'Jack':((options.u.toUpperCase() === "BEN" || options.u.toUpperCase() === "HuYen".toUpperCase())?'Ben':((options.u.toUpperCase() === "JASON" || options.u.toUpperCase() === "DaRen".toUpperCase())?'Jason':'Jack'))):'Jack'

    console.log(name);

    const note = (options.d)?'':'Note'
    console.log(note);

    const key = place + cell + name + note

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

    if (options.i) {
        comhost = options.i
    }
    if (options.r) {
        rpihost = options.r
    }
    if (options.c) {
        comPort = options.c
    }
    if (options.o) {
        ownPort = options.o
    }
    if (options.k) {
        carPort = options.k
    }

    if (options.s) {
        const selfKey = options.s
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