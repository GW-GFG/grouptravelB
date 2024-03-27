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

const allowedOrigins = ['https://grouptravel-b-gwgfg.vercel.app', 'https://grouptravelgw-gfg.vercel.app', 'https://grouptravel-b-gwgfg.vercel.app/upload'];

app.use(cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by Gwen'));
      }
    }
  }));


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
