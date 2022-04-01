const mysql = require('mysql');
const mysql_connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '@#Ju!c90#@',
  database: 'pos_online',
  port: '3306'
});

mysql_connection.connect( async function(err) {
  if (err) throw err;
  console.log('Database is connected successfully !');
});

module.exports = mysql_connection;