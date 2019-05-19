//Libraries
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cors = require('cors');
const pino = require('pino');
const expressPino = require('express-pino-logger');

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const expressLogger = expressPino({ logger });

//server configuration
var basePath = '/users';
var port = 6200;

// Connection to DB
mongoose.connect('mongodb://mongodb')
    .then(() => {
        console.log('Backend Started');
    })
    .catch(err => {
        console.error('Backend error:', err.stack);
        process.exit(1);
    });

// Routes and Backend Functionalities
var usersRoutes = require('./src/routes/Users');

// App Instance
var app = express();
app.use(express.static('public'));
app.use(cors());
app.use(expressLogger);
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(basePath, usersRoutes);

// Execute App
app.listen(port, () => {
    console.log('TodoList Backend running on Port: ',port);
    logger.info('Server running on port %d', port);
});
