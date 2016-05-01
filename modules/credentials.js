module.exports = () => {
    try {
        var localCreds = require('./local_credentials');
        return localCreds;
    } catch (err) {
        return {
            mlab: process.env.MONGOLAB_URI
        };
    }
};
