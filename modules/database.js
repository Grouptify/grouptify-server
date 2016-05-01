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
                // let searchedSkills = 0;
                // let projects = [];
                // skills.forEach((skill) => {
                //     connection.projects.find({skills: skills, 'team.4': {$exists: false}}, (err, projects) => {
                //         searchedSkills++;
                //         if (searchedSkills >= skills.length) {
                //             resolve(projects);
                //         }
                //     });
                // });
                connection.projects.find({skills: {$in: skills}}, (err, projects) => {
                    resolve(projects);
                });
            });
        },
        createProject: (userID, name, team, description, skills) => {
            return new Promise((resolve, reject) => {
                connection.projects.insert({name: name, team: team, swipes: [], description: description, skills: skills}, (err, project) => {
                    if (err) {
                        console.error(err);
                        reject(err);
                    } else {
                        connection.users.updateOne({_id: mongojs.ObjectId(userID)}, {project: project._id.toString()}, (err) => {
                            if (err) {
                                console.error(err);
                                reject(err);
                            } else {
                                resolve();
                            }
                        });
                    }
                });
            });
        },

        createUser: (email, password, name, skills) => {
            return new Promise((resolve, reject) => {
                connection.users.findOne({email: email}, (err, user) => {
                    if (!user) {
                        connection.users.insert({email: email, password: password, name: name, skills: skills, swipes: [], project: null}, (err) => {
                            if (err) {
                                console.error(err);
                                reject(err);
                            }
                            resolve();
                        });
                    } else {
                        reject('Email already in use');
                    }
                });
            });
        },
        getUserByEmail: (email) => {
            return new Promise((resolve, reject) => {
                connection.users.findOne({email: email}, (err, user) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(user);
                    }
                });
            });
        },
        authenticateUser: (email, password) => {
            return new Promise((resolve, reject) => {
                connection.users.findOne({email: email, password: password}, (err, user) => {
                    console.log('user');
                    console.log(user);
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
