var mysql = require('mysql');
var conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database:'demo',
    port: 3306
});
conn.connect();

var query ='SELECT * FROM parking';

conn.query(query, function(err, rows, fields) {
    if (err) throw err;
    console.log('The result is: ', rows);
	console.log('The license_plate is: ', rows[0]['license_plate']);
}); 
conn.end();