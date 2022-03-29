var app = require('../app');
var http = require('http');

const port = normalizePort(process.env.PORT || '3002');
app.set('port', port);
const server = http.createServer(app);
server.listen(port);
