const express = require('express');
var bodyParser = require("body-parser");
const app = express();

var mysql = require('mysql');
var conn = mysql.createConnection({
	host: 'localhost',
	user: 'test',
	password: '123456',
	database: 'demo',
	port: 3306
});
conn.connect();
// console.log(conn.config)
conn.end();

const cost_every_hour = 30
function getParkingTime(date) {
	const differenceInMin = Math.floor((Date.now() - date.getTime()) / 1000 / 60);

	const minPartOfDiff = differenceInMin % 60
	const hourPartOfDiff = Math.floor(differenceInMin / 60)

	return [differenceInMin, (hourPartOfDiff>0)?`${hourPartOfDiff} 小時 ${minPartOfDiff} 分鐘`:`${minPartOfDiff} 分鐘`]
}
function getParkingCost(diffInMin){
	if (diffInMin < 60){
		return cost_every_hour
	}
	return Math.ceil((diffInMin-60)/30)*cost_every_hour/2+cost_every_hour
}

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
	console.log(req.query.err);
	console.log(req.query.tel);
	var num_input = req.query.tel;
	var query = "SELECT * FROM parking where id=?";
	conn = mysql.createConnection(conn.config)

	conn.query(query, num_input, function (err, rows, fields) {
		if (err) {
			res.redirect('/');
		};
		console.log(`SELECT * FROM parking where id="${num_input}"`)
		console.log(rows);
		//rows.forEach(element => console.log(element));
		if (rows.length == 1) {
			const data = rows[0]
			const [diffInMin, diffString] = getParkingTime(data['enter_time'])
			const cost = getParkingCost(diffInMin)
			res.render('car_stop', {
				'car_id': data['id'],
				'license_plate': data['license_plate'],
				'space_id': data['space_id'],
				'enter_time': data['enter_time'],
				'duration': diffString,
				// 'out_time': data['out_time'],
				'paid_off': data['paid_off'],
				'cost': cost,
				'had_paid': data['had_paid'],
				'more_money': cost - data['had_paid'],
				// 'paid_time': data['paid_time'],
				'car_img': data['car_img'],
				'car_img_type': data['car_img_type'],
				'error': '' || req.query.err,
				//'all_rows':rows,
			});
			console.log('Found:' + num_input);
		} else {
			//response.send(`<h1>Hello, Node</h1>`);
			console.log('null:' + num_input);
		};

	});
	conn.end();
})

app.post('/found_lince', function (req, res) {

	var text_input = req.body.input;
	var query = "SELECT * FROM parking where license_plate like ?";
	conn = mysql.createConnection(conn.config)

	conn.query(query, ['%' + text_input + '%'], function (err, rows, fields) {
		if (err) {
			res.redirect('/');
		};
		console.log(`SELECT * FROM parking where license_plate like '%${text_input}%'`)
		console.log(rows);
		//rows.forEach(element => console.log(element));
		if (rows != '') {

			res.render('founds', {
				'all_rows': rows
			});
			console.log('Found:' + text_input);
		} else {
			res.send('<center><br><br><br><br><br><br><br><br><br><br><br><br><br><br><h1>找不到車輛</h1><br><p>請於15分鐘內離場</p><div id="timeBox"></div></center>'
				+ '<Script>    var count = 3;  function countDown(){  	 	document.getElementById("timeBox").innerHTML= count;  		count -= 1;  		if (count == 0){  		location.href="/";  	}  		setTimeout("countDown()",1000);  }    countDown();  </Script>');
			console.log('Happy free');
			//response.send(`<h1>Hello, Node</h1>`);
			console.log('null:' + text_input);
		};

	});
	conn.end()
});

app.post('/give_money', function (req, res) {
	var enter_money = req.body.enter_money;
	var had_paid = req.body.had_paid;
	var more_money = req.body.more_money;
	var carid = req.body.carid;

	// console.log(`enter_money: ${enter_money}`)
	// console.log(`had_paid: ${had_paid}`)
	// console.log(`carid: ${carid}`)

	// console.log(Number(enter_money))
	// console.log(typeof Number(enter_money))
	// console.log(parseInt(enter_money))
	// console.log(typeof parseInt(enter_money))
	// console.log(parseFloat(enter_money))
	// console.log(typeof parseFloat(enter_money))
	// console.log(parseInt(Number(enter_money)))
	// console.log(typeof parseInt(Number(enter_money)))

	const enter_money_float = parseFloat(enter_money)
	const enter_money_number = Number(enter_money)

	const notInteger = isNaN(enter_money_number) || !Number.isInteger(enter_money_float)

	if (notInteger) {
		return res.redirect(`/check?tel=${carid}&err="請輸入整數"`)
	}

	enter_money = enter_money_number
	had_paid = Number(had_paid)
	more_money = Number(more_money)

	if (enter_money <= 0) {
		return res.redirect(`/check?tel=${carid}&err="請確實付款"`)
	}

	if (enter_money < more_money) {
		console.log('unHappy');
		conn = mysql.createConnection(conn.config)

		conn.query('update parking set had_paid = ? where id = ?', [enter_money + had_paid, carid], (err, result) => {
			if (err) {
				console.log('沒成功更新付款')
			}
		})
		conn.end()
		return res.redirect(`/check?tel=${carid}&err="尚未付清\\n還差 ${more_money - enter_money} 元"`)
	}



	res.send('<center><br><br><br><br><br><br><br><br><br><br><br><br><br><br><h1>繳費完成</h1>' + ((enter_money > more_money) ? `找零 ${enter_money - more_money}` : '') + '<br><p>請於15分鐘內離場</p><div id="timeBox"></div></center>'
		+ '<Script>    var count = 5;  function countDown(){  	 	document.getElementById("timeBox").innerHTML= count;  		count -= 1;  		if (count == 0){  		location.href="/";  	}  		setTimeout("countDown()",1000);  }    countDown();  </Script>');
	console.log('Happy');

	var query = "UPDATE parking SET paid_off = ?, had_paid = ?, paid_time = current_timestamp() WHERE id = ?";
	conn = mysql.createConnection(conn.config)
	conn.query(query, [1, had_paid + more_money, carid], function (err, rows, fields) {
		if (err) {
			console.log('沒成功更新付清')
		};
	});
	conn.end()
});

app.post('/gate', function (req, res) {

	var num_input = req.body.input;
	var query = 'SELECT * FROM parking where license_plate=?';
	conn = mysql.createConnection(conn.config)

	conn.query(query, num_input, function (err, rows, fields) {
		if (err) {
			res.redirect('/');
		};
		//'paid_off': rows[0]['paid_off'],
		if (rows != '') {
			if (rows[0]['paid_off'] != 0) {
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
	conn.end()
});

app.get('/all', function (req, res) {

	var num_input = 'see all';
	var query = "SELECT * FROM parking ";
	conn = mysql.createConnection(conn.config)

	conn.query(query, function (err, rows, fields) {
		if (err) {
			res.redirect('/');
		};

		console.log(`Found: ${rows[0]}`);
		console.log(rows);
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
	conn.end()
});

app.get('/add', function (req, res) {
	var num_input = req.query.tel;
	console.log(req.query.tel);

	var query = "INSERT INTO parking (id, paid_off, license_plate, space_id, enter_time, out_time, car_img) VALUES (NULL, '0', ?, '0', current_timestamp(), current_timestamp(), 'img/null.jpg')";
	conn = mysql.createConnection(conn.config)

	conn.query(query, num_input, function (err, rows, fields) {
		if (err) throw err;
		console.log('完成寫入車牌號碼:', num_input); //單一位置
		res.send('<center><br><br><br><br><br><br><br><br><br><br><br><br><br><br><h1>完成寫入</h1><br><p></p><div id="timeBox"></div></center>'
			+ '<Script>    var count = 5;  function countDown(){  	 	document.getElementById("timeBox").innerHTML= count;  		count -= 1;  		if (count == 0){  		location.href="/";  	}  		setTimeout("countDown()",1000);  }    countDown();  </Script>');

	});
	conn.end()
});
// 監聽 port

const port = process.env.port || 3020;
// console.log(process.env)
app.listen(port)
console.log(`http://127.0.0.1:${port}`);
console.log(`http://127.0.0.1:${port}/gate 門檻`);
console.log(`http://127.0.0.1:${port}/all 查所有車牌`);
console.log(`http://127.0.0.1:${port}/add?tel=X 新增車牌`);