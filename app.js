const express = require ( "express" );
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser')
//defind routes
const indexRouter = require('./routes/index');
const stockRouter = require('./routes/stock_routes');
const loginRouter = require('./routes/login');

//use express
const app = express();

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// Set Url
app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/stock', stockRouter);


// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
  
    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });

module.exports = app;