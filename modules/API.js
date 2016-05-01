module.exports = function (baseURL, app, database, _port) {
    var PORT = (_port || process.env.PORT || 8080);
    var server;
    var allowableOrigins = '*';

    return {
        init: () => {
            return new Promise(function (resolve) {
                app.get(baseURL, (req, res) => {
                    res.send('Grouptify API Server');
                });

                app.use((req, res, next) => {
                    res.set('Access-Control-Allow-Origin', allowableOrigins);
                    next();
                });

                app.post(baseURL + 'user', (req, res) => {
                    if (req.body.email && req.body.password && req.body.name && req.body.skills) {
                        database.createUser(req.body.email, req.body.password, req.body.name, req.body.skills).then((user) => {
                            req.session.userID = user._id.toString();
                            res.json(user);
                        }).catch((err) => {
                            res.json({error: err});
                        });
                    } else {
                        res.json({error: 'Missing credentials'});
                    }
                });
                app.post(baseURL + 'user/auth', (req, res) => {
                    if (req.body.email && req.body.password) {
                        database.authenticateUser(req.body.email, req.body.password).then((user) => {
                            console.log(user);
                            req.session.userID = user._id.toString();
                            req.session.name = user.name;
                            req.session.email = user.email;
                            req.session.skills = user.skills;
                            res.json(user);
                        }).catch((err) => {
                            res.json({error: err});
                        });
                    } else {
                        res.json({error: 'Missing credentials'});
                    }
                });

                app.post(baseURL + 'project', (req, res) => {
                    if (req.body.name && req.body.description && req.body.skills) {
                        if (!Array.isArray(req.body.team)) {
                            req.body.team = [req.body.team];
                        }
                        database.createProject(req.session.userID, req.body.name, req.body.team, req.body.description, req.body.skills).then((project) => {
                            res.json(project);
                        }).catch((err) => {
                            res.json(err);
                        });
                    } else {
                        res.json({error: 'Missing credentials'});
                    }
                });

                app.get(baseURL + 'projects', (req, res) => {
                    if (req.session.userID) {
                        database.getProjectsBySkills(req.session.skills).then((projects) => {
                            res.json(projects);
                        });
                    } else {
                        res.json({error: 'Not authenticated'});
                    }
                });

                resolve();
            });
        },
        start: () => {
            return new Promise(function (resolve, reject) {
                server = app.listen(PORT, function () {
                    console.log(`API server listening on port ${PORT} @ "${baseURL}"`);
                    resolve();
                });
                server.on('clientError', (err) => {
                    reject(err);
                });
            });
        },
        stop: () => {
            return new Promise(function (resolve) {
                server.close(() => {
                    resolve();
                });
            });
        }
    };
};
