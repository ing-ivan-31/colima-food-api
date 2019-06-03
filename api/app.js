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
require('dotenv').config();

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
app.use(session({ secret: 'colima-food-api', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false }));


//Configure Mongoose to promises and connect to DB.
mongoose.promise = global.Promise;
mongoose.connect('mongodb://mongodb:27017/' + process.env.DB_NAME, { useNewUrlParser: true } );
mongoose.set('debug', true);

//Passport
require('./src/config/passport');
//Routes
app.use(require('./src/routes'));

// 404 Handler
app.use((req, res, next) => {
    //res.status(404).send('The route does not exist');
    res.status(404).sendFile(path.join(__dirname, 'public/404.html'))
});

// 500 handler
app.use((err, req, res, next) => {
    console.log(err.stack);
    let statusError = err.status || 500;
    let objError = {
        name: err.name,
        message: err.message,
        code: err.code,
        status: err.status
    };
    res.status(statusError).json( { error:objError } )
});

// Execute App
app.listen(port, () => {
    console.log('Backend running on Port: ',port);
    logger.info('Server running on port %d', port);
});
