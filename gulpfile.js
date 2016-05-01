var gulp = require('gulp');
var fork = require('child_process').fork;

var nodeServer;
gulp.task('start-node', function () {
    if (nodeServer) {
        nodeServer.send('stop');
        nodeServer.kill(0);
    }

    nodeServer = fork('./main');
    nodeServer.on('err', (err) => {
        console.error(err);
    });
    nodeServer.on('error', (err) => {
        console.error(err);
    });
    nodeServer.on('message', (err) => {
        console.error(err);
    });
    nodeServer.send('start');
});

gulp.task('build', []);
gulp.task('run', ['start-node']);

gulp.task('watch', ['watch.main', 'watch.modules']);
gulp.task('watch.main', function () {
    gulp.watch(['main.js'], ['start-node']);
});
gulp.task('watch.modules', function () {
    gulp.watch(['modules/*.js'], ['start-node']);
});

gulp.task('dev', ['build', 'run', 'watch']);
gulp.task('deploy', ['build', 'run']);

gulp.task('default', ['deploy']);
