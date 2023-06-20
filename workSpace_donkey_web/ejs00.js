let express = require('express');
//檔案讀取
var fs = require("fs");
let engine = require('ejs-locals');
  //載入express模組
let app = express();
  // 使用express
 var bodyParser = require("body-parser");
 //login 狀態
 var isLogin = false;
var checkLoginStatus = function(req, res) {
  isLogin = false;

};
 //login 狀態
 app.use(bodyParser.urlencoded({ extended: true }));
 //post get用
 //使用session
 var  cookieParser = require('cookie-parser');
app.use(cookieParser('123456789'));// sign for cookie
//app.use('/cookie', routerCookie);
//使用session
//app.use(express.cookieParser('123456789'));//記得設定key來傳遞資訊
//使用ejs
 app.engine('ejs', engine);
app.set('views', './views');
app.set('view engine', 'ejs');
 //調用靜待資料夾檔案
app.use(express.static(__dirname + '/donkeyCar_html')); //Serves resources from public folder

//路由控制
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
})

app.get('/user', function (req, res) {
res.render('user');
})


app.get('/logout', function (req, res) {
console.log('logout USER .'+req.cookies.name);
res.clearCookie('name',{path:'/'}); //清除目標
isLogin = false;
res.redirect('/');
})

app.get('/resign1.html', function (req, res) {
res.render('resign',{
'title': '註冊新人員'});
})

app.get('/control.html', function (req, res) {
res.render('control',{
'title': '控制台'});
})

app.get('/about.html', function (req, res) {
res.render('about',{
'title': '關於'});
})

app.get('/login.html', function (req, res) {
res.render('login',{
'title': '登入'});
})

//路由控制
//get post 控制
app.post('/regist',function(req,res){
	
  var uc=req.body.uc;
  var pw=req.body.passWord;
  var cn=req.body.customName;

  var html = '帳號：' + uc + '<br>' +
             '密碼：' + pw + '<br>'+'完成註冊';
  res.send(html);
 
  fs.readFile( __dirname + "/donkeyCar_html/json/" + "data.json", 'utf8', function (err, data) {
       data = JSON.parse( data ); //將目標json 轉為js對象
		var arr = Object.keys(data);  //將js對象套用至object
		var length = arr.length+1; //獲得json資料總長度arr.length console.log(arr.length);
		var newuserl = "user"+length;
		var user = { //console.log(user);
		[newuserl] : {  //將變數用作key的寫法
		  "name" :uc,
		  "password" : pw,
		  "customName" : cn,
		  "id": length
	   }
	}
       data[newuserl] = user[newuserl];
	   //console.log(data[newuserl]);
       //console.log( data );
       res.end( JSON.stringify(data));
	   fs.writeFile(__dirname + "/donkeyCar_html/json/" + "data.json", JSON.stringify(data), function (err) {
    if (err)
        console.log(err);
    else
        console.log('new USER .'+uc);
});
   });

//帳號登入
});
app.post('/login',function(req,res){
	
  var uc=req.body.uc;
  var pw=req.body.passWord;
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
      res.cookie('lastName', pw, { path: '/', signed: true, maxAge:600000 }); //set cookie
	  */
res.redirect('/');
 // res.send(html);

  
  
        console.log(' USER login:.'+uc);
});
 

//get post 控制
let port = 3000;
  //設定port位置
app.listen(port);
  // 監聽 port



console.log('http://localhost:3000/')