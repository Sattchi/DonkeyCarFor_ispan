// 檔案讀取
var fs = require("fs");

// 載入express模組
let express = require('express');
// 使用express
let app = express();

// 解析器
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

// login 狀態
var isLogin = false;
var checkLoginStatus = function (req, res) {
    isLogin = false;
};

//使用session
var cookieParser = require('cookie-parser');
app.use(cookieParser('123456789'));// sign for cookie
//app.use('/cookie', routerCookie);
//使用session
//app.use(express.cookieParser('123456789'));//記得設定key來傳遞資訊

//使用ejs
let engine = require('ejs-locals');
app.engine('ejs', engine);
// 讀取 EJS 檔案位置
app.set('views', './views');
// 用 EJS 引擎跑模板
app.set('view engine', 'ejs');

//調用靜態資料夾檔案
app.use(express.static(__dirname + '/donkeyCar_html')); //Serves resources from public folder

function readTextFile(file, callback) {
    fs.readFile(file, function (err, text) {
        callback(text);
    });
}

readTextFile("donkeyCar_html/json/net.json", function(text){
    netData = JSON.parse(text);
    console.log(netData);
});

// 查看用戶代理IP
app.use(function (req, res, next){
    console.log("用戶IP位址: "+req.connection.remoteAddress);
    console.log("用戶IP位址: "+(req.connection || req.socket || req).remoteAddress);
    next();
});

//路由控制
//get 控制
app.get('/', function (req, res) {
    /*
    res.cookie('name', 'lulu', {
        maxAge: 10000, // 只存在n秒，n秒後自動消失
        httpOnly: true // 僅限後端存取，無法使用前端document.cookie取得
    })*/
    res.render('index', {
        'title': '首頁',
        'titleH2': req.cookies.name,
        'loginStatus': isLogin //登入狀態
    });

    //console.log(req.cookies);
    //console.log(req.cookies.name); //找單個cookies
});

app.get('/user', function (req, res) {
    res.render('user');
});


app.get('/logout', function (req, res) {
    console.log('logout USER .' + req.cookies.name);
    res.clearCookie('name', { path: '/' }); //清除目標
    isLogin = false;
    res.redirect('/');
});

app.get('/resign1.html', function (req, res) {
    res.render('resign', {
        'title': '註冊新人員'
    });
});

app.get('/control.html', function (req, res) {
    res.render('control', {
        'title': '控制台',
        // 'ctrWeb': 'http://192.168.52.94:6543/',
        // 'carWeb': 'http://192.168.52.94:8887/drive'
        'ctrWeb': netData["0"].car1.ctrWeb,
        'carWeb': netData["0"].car1.carWeb
    });
});

app.get('/about.html', function (req, res) {
    res.render('about', {
        'title': '關於'
    });
});

app.get('/login.html', function (req, res) {
    res.render('login', {
        'title': '登入'
    });
});

//路由控制
//post 控制
app.post('/regist', function (req, res) {

    var uc = req.body.uc;
    var pw = req.body.passWord;
    var cn = req.body.customName;

    var html = '帳號：' + uc + '<br>' +
        '密碼：' + pw + '<br>' + '完成註冊';
    res.send(html);

    fs.readFile(__dirname + "/donkeyCar_html/json/" + "data.json", 'utf8', function (err, data) {
        data = JSON.parse(data); //將目標json 轉為js對象
        var arr = Object.keys(data);  //將js對象套用至object
        var length = arr.length + 1; //獲得json資料總長度arr.length console.log(arr.length);
        var newuserl = "user" + length;
        var user = { //console.log(user);
            [newuserl]: {  //將變數用作key的寫法
                "name": uc,
                "password": pw,
                "customName": cn,
                "id": length
            }
        }
        data[newuserl] = user[newuserl];
        //console.log(data[newuserl]);
        //console.log( data );
        res.end(JSON.stringify(data));
        fs.writeFile(__dirname + "/donkeyCar_html/json/" + "data.json", JSON.stringify(data), function (err) {
            if (err)
                console.log(err);
            else
                console.log('new USER .' + uc);
        });
    });

    //帳號登入
});
app.post('/login', function (req, res) {

    var uc = req.body.uc;
    var pw = req.body.passWord;
    //var cn=req.body.customName;
    /*
      var html = '帳號：' + uc + '<br>' +
                 '密碼：' + pw + '<br>'+'完成登入';*/
    res.cookie('name', uc, {
        maxAge: 100000, // 只存在n秒，n秒後自動消失
        httpOnly: false // 僅限後端存取，無法使用前端document.cookie取得
    })
    isLogin = true;
    /*
    res.cookie('firstName', uc, { path: '/', signed: true, maxAge:600000});  //set cookie
    res.cookie('lastName', pw, { path: '/', signed: true, maxAge:600000 });  //set cookie
    */
    res.redirect('/');
    // res.send(html);
    console.log(' USER login:.' + uc);
});

//設定port位置
let port = 3000;
host = "127.0.0.1";
// 監聽 port
app.listen(port, function () {
    console.log(`伺服器在$(port)埠口開工了。`);
    console.log(`http://$(host):$(port)/`);
});