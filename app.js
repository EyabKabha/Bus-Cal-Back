var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const cookieEncrypter = require('cookie-encrypter')
var logger = require('morgan');
const cors = require('cors');
const secretKey = '9872buscalCookies0Secret7Key1059'

var indexRouter = require('./routes/index');
var customersRouter = require('./routes/customers');
var companiesRouter = require('./routes/companies');
var employeesRouter = require('./routes/employees');
var loginRouter = require('./routes/login');
var signUpRouter = require('./routes/signUp');
var ordersRouter = require('./routes/orders');
var adminRouter = require('./routes/admin');
var citiesRouter = require('./routes/cities');

var schedule = require('node-schedule');

//// check connection with sequelize 
const db = require('./config/database');

db
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

const check = require('./shared/timer.js');
check.checkOrders;
check.checkavailableVehicles;




var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors({origin: 'http://buscal.co.il', credentials: true}
));

// // Add headers
// app.use(function (req, res, next) {

//   // Website you wish to allow to connect
//   res.setHeader('Access-Control-Allow-Origin', '*');

//   // Request methods you wish to allow
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

//   // Request headers you wish to allow
//   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

//   // Set to true if you need the website to include cookies in the requests sent
//   // to the API (e.g. in case you use sessions)
//   res.setHeader('Access-Control-Allow-Credentials', true);

//   // Pass to next layer of middleware
//   next();
// });

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(secretKey));
app.use(cookieEncrypter(secretKey))
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/customers', customersRouter);
app.use('/employees', employeesRouter);
app.use('/login', loginRouter);
app.use('/signup', signUpRouter);
app.use('/companies', companiesRouter);
app.use('/orders', ordersRouter);
app.use('/cities', citiesRouter);
app.use('/admin', adminRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


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
