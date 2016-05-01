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
                    if (req.body.email && req.body.password) {
                        database.authenticateUser(req.body.email, req.body.password).then((user) => {
                            req.session.userID = user._id;
                            res.json(user);
                        }).catch((err) => {
                            res.json(err);
                        });
                    } else {
                        res.json({error: 'Missing credentials'});
                    }
                });

                resolve();
            });
        },
        start: () => {
            return new Promise(function (resolve, reject) {
                server = app.listen(PORT, function () {
                    console.log(`API server listening on port ${PORT}`);
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
