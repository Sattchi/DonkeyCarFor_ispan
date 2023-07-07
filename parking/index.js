const express = require('express');
var bodyParser = require("body-parser");
const app = express();

var mysql = require('mysql');
var conn = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '123456',
	database: 'demo',
	port: 3306
});
conn.connect();
//conn.end();

app.use(bodyParser.urlencoded({ extended: true }));
//調用靜待資料夾檔案
app.use(express.static(__dirname + '/html')); //Serves resources from public folder
// EJS 核心
const engine = require("ejs-locals");
app.engine("ejs", engine);
// 讀取 EJS 檔案位置
app.set('views', './views');
// 用 EJS 引擎跑模板
app.set("view engine", "ejs");

app.get('/', function (req, res) {

	res.render('index', {
		'title': '首頁',
		'titleH2': 'f',
	});
})

app.get('/gate', function (req, res) {
	res.render('gate');
})

app.get('/check', function (req, res) {
	//console.log(req.query.name);
	console.log(req.query.tel);
	var num_input = req.query.tel;
	var query = "SELECT * FROM parking where id=" + num_input;

	conn.query(query, function (err, rows, fields) {
		if (err) {
			res.redirect('/');
		};
		// console.log('Found:'+rows[1]);
		//rows.forEach(element => console.log(element));
		if (rows != '') {
			res.render('car_stop', {
				'license_plate': rows[0]['license_plate'],
				'confirm': rows[0]['confirm'],
				'car_img_path': rows[0]['car_img_path'],
				'space_id': rows[0]['space_id'],
				'money': '100',
				'enter_time': rows[0]['enter_time'],
				'out_time': rows[0]['out_time']
				//'all_rows':rows
			});
			console.log('Found:' + num_input);
		} else {
			//response.send(`<h1>Hello, Node</h1>`);
			console.log('null:' + num_input);
		};

	});
})



app.post('/found_lince', function (req, res) {

	var num_input = req.body.input;
	var query = "SELECT * FROM parking where license_plate like '%" + num_input + "%'";

	conn.query(query, function (err, rows, fields) {
		if (err) {
			res.redirect('/');
		};

		// console.log('Found:'+rows[1]);
		//rows.forEach(element => console.log(element));
		if (rows != '') {

			res.render('founds', {
				'license_plate': rows[0]['license_plate'],
				'confirm': rows[0]['confirm'],
				'car_img_path': rows[0]['car_img_path'],
				'space_id': rows[0]['space_id'],
				'money': '100',
				'enter_time': rows[0]['enter_time'],
				'out_time': rows[0]['out_time'],
				'all_rows': rows
			});
			console.log('Found:' + num_input);
		} else {
			res.send('<center><br><br><br><br><br><br><br><br><br><br><br><br><br><br><h1>找不到車輛</h1><br><p>請於15分鐘內離場</p><div id="timeBox"></div></center>'
				+ '<Script>    var count = 3;  function countDown(){  	 	document.getElementById("timeBox").innerHTML= count;  		count -= 1;  		if (count == 0){  		location.href="/";  	}  		setTimeout("countDown()",1000);  }    countDown();  </Script>');
			console.log('Happy free');
			//response.send(`<h1>Hello, Node</h1>`);
			console.log('null:' + num_input);
		};

	});
});


app.post('/give_money', function (req, res) {

	var num_input = '1';
	var enter_money = req.body.enter_money;
	var money = req.body.money;
	var license_plate = req.body.license_plate;
	var query = "UPDATE parking SET confirm = '1' WHERE parking.license_plate = ?";

	if (enter_money >= money) {
		res.send('<center><br><br><br><br><br><br><br><br><br><br><br><br><br><br><h1>繳費完成</h1><br><p>請於15分鐘內離場</p><div id="timeBox"></div></center>'
			+ '<Script>    var count = 5;  function countDown(){  	 	document.getElementById("timeBox").innerHTML= count;  		count -= 1;  		if (count == 0){  		location.href="/";  	}  		setTimeout("countDown()",1000);  }    countDown();  </Script>');
		console.log('Happy');
		conn.query(query, license_plate, function (err, rows, fields) {
			if (err) {
			};
		});
	} else {
		//response.send(`<h1>Hello, Node</h1>`);
		console.log('unHappy');
	}

});

app.post('/gate', function (req, res) {

	var num_input = req.body.input;
	var query = 'SELECT * FROM parking where license_plate=?';

	conn.query(query, num_input, function (err, rows, fields) {
		if (err) {
			res.redirect('/');
		};
		//'confirm': rows[0]['confirm'],
		if (rows != '') {
			if (rows[0]['confirm'] != 0) {
				res.send('<center><br><br><br><br><br><br><br><br><br><br><br><br><br><br><h1>請離場</h1><br><p>請於15分鐘內離場</p><div id="timeBox"></div></center>'
					+ '<Script>    var count = 5;  function countDown(){  	 	document.getElementById("timeBox").innerHTML= count;  		count -= 1;  		if (count == 0){  		location.href="/";  	}  		setTimeout("countDown()",1000);  }    countDown();  </Script>');
			} else {
				res.send('<center><br><br><br><br><br><br><br><br><br><br><br><br><br><br><h1>尚未繳費</h1><br><p>請前往繳費</p><div id="timeBox"></div></center>'
					+ '<Script>    var count = 5;  function countDown(){  	 	document.getElementById("timeBox").innerHTML= count;  		count -= 1;  		if (count == 0){  		location.href="/";  	}  		setTimeout("countDown()",1000);  }    countDown();  </Script>');
			};
			//console.log('Found:'+num_input);
		} else {
			//response.send(`<h1>Hello, Node</h1>`);
			console.log('null:' + num_input);
		};

	});
});

app.get('/all', function (req, res) {

	var num_input = 'see all';
	var query = "SELECT * FROM parking ";

	conn.query(query, function (err, rows, fields) {
		if (err) {
			res.redirect('/');
		};

		// console.log('Found:'+rows[1]);
		//rows.forEach(element => console.log(element));
		if (rows != '') {
			res.render('founds', {
				'all_rows': rows
			});
			console.log('Found:' + num_input);
		} else {
			//response.send(`<h1>Hello, Node</h1>`);
			console.log('null:' + num_input);
		};

	});
});

app.get('/add', function (req, res) {
	var num_input = req.query.tel;
	console.log(req.query.tel);

	var query = "INSERT INTO parking (id, confirm, license_plate, space_id, enter_time, out_time, car_img_path) VALUES (NULL, '0', ?, '0', current_timestamp(), current_timestamp(), 'img/null.jpg')";;

	conn.query(query, num_input, function (err, rows, fields) {
		if (err) throw err;
		console.log('完成寫入車牌號碼:', num_input); //單一位置
		res.send('<center><br><br><br><br><br><br><br><br><br><br><br><br><br><br><h1>完成寫入</h1><br><p></p><div id="timeBox"></div></center>'
			+ '<Script>    var count = 5;  function countDown(){  	 	document.getElementById("timeBox").innerHTML= count;  		count -= 1;  		if (count == 0){  		location.href="/";  	}  		setTimeout("countDown()",1000);  }    countDown();  </Script>');
	});
});
// 監聽 port

const port = process.env.port || 3000;
app.listen(port)
console.log('127.0.0.1:3000');
console.log('127.0.0.1:3000/gate 門檻');
console.log('127.0.0.1:3000/all 查所有車牌');
console.log('127.0.0.1:3000/add?tel=X 新增車牌');