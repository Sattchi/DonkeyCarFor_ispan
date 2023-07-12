const mysql = require('mysql');

const pool = mysql.createPool({
	host: 'localhost',
	user: 'test',
	password: '123456',
	database: 'demo',
	port: 3306,
	// multipleStatements: true,
})

const getConnection = function(callback=function(err, conn) {conn.release();}) {
	pool.getConnection(function(err, conn){
		callback(err, conn);
	})
}

module.exports = getConnection;