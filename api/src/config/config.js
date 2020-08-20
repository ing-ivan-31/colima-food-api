(() => {
    'use strict';

    const express = require('express');
    const bodyParser = require('body-parser');
    const cors = require('cors');
    const pino = require('pino');
    const expressPino = require('express-pino-logger');
    const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
    const expressLogger = expressPino({ logger });

    module.exports = (sourcePath, app) => {
        const baseApp = app;
        const getPort = () => process.env.PORT || 6200;
        const getLogger = () => logger;

        const configRoutes = () => {
            baseApp.use(express.static('public'));

            app.use(bodyParser.urlencoded({
                extended: true
            }));

            app.use(bodyParser.json());
            app.use(cors());
            app.use(expressLogger);

            //Passport
            require('./passport');

            //Routes
            app.use(require('../routes'));

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
        };

        const configureConnection = () => {
            // Database
            require('../services/database');
        };

        const init = () => {
            configRoutes();
            configureConnection();
        };

        return {
            getPort,
            getLogger,
            init
        }
    };
})();
