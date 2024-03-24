// require('dotenv').config();

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var tripsRouter = require('./routes/trips');
var activitiesRouter = require('./routes/activities');
var accommodationsRouter = require('./routes/accommodations');
var declineRouter = require('./routes/decline');
var planningRouter = require('./routes/planning');
var chatRouter = require('./routes/chat');


var app = express();

const fileUpload = require('express-fileupload');
app.use(fileUpload());

const cors = require('cors');
app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/trips', tripsRouter);
app.use('/activities', activitiesRouter);
app.use('/accommodations', accommodationsRouter);
app.use('/decline', declineRouter);
app.use('/planning', planningRouter);
app.use('/chat', chatRouter);

module.exports = app;
