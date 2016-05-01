var credentials = require('./modules/credentials')();

var database = require('./modules/database')(credentials.mlab);

var API;
var express = require('express');
var app;
var bodyParser = require('body-parser');
var session = require('express-session');

module.exports = {
    init: () => {
        return new Promise(function (resolve, reject) {
            database.init().catch((err) => {
                console.error(err);
            });

            app = express();
            app.use(bodyParser.json()); // for parsing application/json
            app.use(bodyParser.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded
            app.use(session({
                secret: 'keyboard cat',
                resave: false,
                saveUninitialized: true,
                cookie: {secure: (app.get('env') === 'production')}
            })); // for storing server side session data
            API = require('./modules/API')('/', app, database);
            API.init().catch((err) => {
                console.error(err);
            });

            resolve();
        });
    },
    start: () => {
        return new Promise(function (resolve, reject) {
            database.start().catch((err) => {
                console.error(err);
            });
            API.start().catch((err) => {
                console.error(err);
            });
            resolve();
        });
    },
    stop: () => {
        return new Promise(function (resolve, reject) {
            database.stop().catch((err) => {
                console.error(err);
            });
            API.stop().catch((err) => {
                console.error(err);
            });
            resolve();
        });
    }
};

process.on('message', (message, data) => {
    switch (message) {
        case 'start':
            module.exports.init().then(() => {
                module.exports.start();
            });
            break;
        case 'stop':
            module.exports.stop();
            break;
    }
});

process.on('uncaughtException', (e) => {
    console.error(e);
    process.send(e);
});
