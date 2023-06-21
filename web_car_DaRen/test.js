// 網頁讀取本機資料
// function readTextFile(file, callback) {
//     var rawFile = new XMLHttpRequest();
//     rawFile.overrideMimeType("application/json");
//     rawFile.open("GET", file, true);
//     rawFile.onreadystatechange = function() {
//         if (rawFile.readyState === 4 && rawFile.status == "200") {
//             callback(rawFile.responseText);
//         }
//     }
//     rawFile.send(null);
// }

// //usage:
// readTextFile("/Users/Documents/workspace/test.json", function(text){
//     var data = JSON.parse(text);
//     console.log(data);
// });


// --------------------------------------------------

// 檔案讀取
const fs = require("fs");
function readTextFile(file, callback) {
    fs.readFile(file, function (err, text) {
        callback(text);
    });
}

//usage:
readTextFile("www/json/autoModel.json", function (text) {
    console.log(text);
    // console.log(typeof text);
    var data = JSON.parse(text);
    // console.log(typeof data)
    const data1 = { "1": ["1", "2"] };
    console.log(data[2]["para"]);
    console.log(data1[1])

});