//Libraries
let express = require('express');
let path = require('path');
let bodyParser = require('body-parser');
let cors = require('cors');
let pino = require('pino');
let expressPino = require('express-pino-logger');
let logger = pino({ level: process.env.LOG_LEVEL || 'info' });
let expressLogger = expressPino({ logger });
let session = require('express-session');
let mongoose = require('mongoose');

//server configuration
const port = process.env.PORT || 6200;

// App Instance
let app = express();
app.use(express.static('public'));
app.use(cors());
app.use(expressLogger);
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(session({ secret: 'passport-tutorial', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false }));


//Configure Mongoose to promises and connect to DB.
mongoose.promise = global.Promise;
mongoose.connect('mongodb://mongodb:27017/colima-food-api', { useNewUrlParser: true } );
mongoose.set('debug', true);

//Passport
require('./src/config/passport');
//Routes
app.use(require('./src/routes'));

// 404 Handler
app.use((req, res, next) => {
    res.status(404).send('The route does not exist');
});

// 500 handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.sendFile(path.join(__dirname, 'public/500.html'))
});

// Execute App
app.listen(port, () => {
    console.log('Backend running on Port: ',port);
    logger.info('Server running on port %d', port);
});
