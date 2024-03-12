require('dotenv').config();

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var tripsRouter = require('./routes/trips');
var activitiesRouter = require('./routes/activities');
var accomodationsRouter = require('./routes/accomodations');
var declineRouter = require('./routes/decline');
var budgetRouter = require('./routes/budget');
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
app.use('/accomodations', accomodationsRouter);
app.use('/decline', declineRouter);
app.use('/budget', budgetRouter);
app.use('/chat', chatRouter);

module.exports = app;
