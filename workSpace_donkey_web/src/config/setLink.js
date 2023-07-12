const tableOfLink = require('./link.json')
// console.log(tableOfLink)
// comhost = "192.168.32.50"
// rpihost = "192.168.52.94"
// const visitor = []
// const user = []
// const admin = []
// const root = []
// tableOfLink.forEach((element) => {
//     [key, val] = Object.entries(element)[0];
//     if (val["locate"] === "電腦"){
//         val["host"] = comhost;
//     } else {
//         val["host"] = rpihost;
//     }

//     if (val["auth"] === "訪客可見") {
//         visitor.push(val)
//     } else if (val["auth"] === "使用者可見") {
//         user.push(val)
//     } else if (val["auth"] === "後臺可見") {
//         admin.push(val)
//     } else if (val["auth"] === "全權可見") {
//         root.push(val)
//     } else {
//         throw new EvalError("錯誤連結")
//     }

//     // console.log(val)
// });
// console.log(visitor)
// console.log(user)
// console.log(admin)
// console.log(root)

module.exports = function (comhost, rpihost) {
    const visitor = []
    const user = []
    const admin = []
    const root = []
    tableOfLink.forEach((element) => {
        [key, val] = Object.entries(element)[0];
        if (val["locate"] === "電腦"){
            val["host"] = comhost;
        } else {
            val["host"] = rpihost;
        }
    
        if (val["auth"] === "訪客可見") {
            visitor.push(val)
        } else if (val["auth"] === "使用者可見") {
            user.push(val)
        } else if (val["auth"] === "後臺可見") {
            admin.push(val)
        } else if (val["auth"] === "全權可見") {
            root.push(val)
        } else {
            throw new EvalError("錯誤連結")
        }
    });

    return { "visitor": visitor, "user": visitor.concat(user), "admin": visitor.concat(user, admin), "root": visitor.concat(user, admin, root) }
}
