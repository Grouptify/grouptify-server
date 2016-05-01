'use strict';

var mongojs = require('mongojs');
var connection;
var collections = [
    'users',
    'projects',
    'skills'
];

module.exports = function (credentials) {
    let database =  {
        init: () => {
            return new Promise(function (resolve) {
                resolve();
            });
        },
        start: () => {
            return new Promise(function (resolve) {
                connection = mongojs(credentials, collections, {authMechanism: 'ScramSHA1'});
                connection.on('connect', function () {
                    console.log('Connected to mLab Database');
                    resolve();
                });
            });
        },
        stop: () => {
            return new Promise(function (resolve) {
                connection.close();
                resolve();
            });
        },

        // TODO: limit is currently unimplemented
        getProjectsBySkills: (skills, limit) => {
            return new Promise(function (resolve, reject) {
                connection.nodes.find({skills: skills}, (err, projects) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(projects);
                    }
                });
            });
        },
        createProject: (name, team, description, skills) => {
            return new Promise((resolve, reject) => {
                connection.nodes.insert({name: name, team: team, description: description, skills: skills}, (err) => {
                    if (err) {
                        console.error(err);
                        reject(err);
                    }
                    resolve();
                });
            });
        },

        authenticateUser: (email, password) => {
            return new Promise((resolve, reject) => {
                connection.users.findOne({email: email, password: password}, (err, user) => {
                    if (err || !user) {
                        reject(err);
                    } else {
                        resolve(user);
                    }
                });
            });
        }
    };

    return database;
};
