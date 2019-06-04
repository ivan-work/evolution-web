'use strict';

import './globals';

const gulp = require('gulp');
const mocha = require('gulp-mocha');
const flow = require('flow-bin');
const execFile = require('child_process').execFile;
const logger = require('./shared/utils/logger').default;

let watching = false;

const TEST_PATH_WATCH = '{shared,server,client}/**/*.js*(x)';
const TEST_PATH_SHARED = ['shared/**/*.spec.js'];
const TEST_PATH_SERVER = ['server/**/*.spec.js'];
const TEST_PATH_CLIENT = ['client/**/*.spec.js', 'client/**/*.spec.jsx'];

function runFlow(cmd, callback) {
  execFile(flow, cmd, {
    cwd: module.__dirname
  }, function (err, stdout, stderr) {
    if (err && stdout.length > 0) {
      callback(stdout);
    }
    else if (err) {
      callback(err);
    }
    else {
      callback();
    }
  });
}

const testWatch = (paths) => () => gulp.src(paths)
  .pipe(mocha({
    bail: true
    , require: [
      '@babel/register'
      , '@babel/polyfill'
      , 'source-map-support/register'
      , 'ignore-styles'
      , './globals'
      , './shared/test-helper.js'
    ]
  }))
  .on('error', function (e) {
    logger.error(e);
    this.emit('end');
  });

gulp.task('test:setup', (done) => {
  watching = true;
  process.env.TEST = true;
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'secret';
  // process.env.DEBUG = '*';
  done();
});

gulp.task('flow:check', (done) => {
  runFlow(['check'], done);
});

// gulp.task('test:shared:once', gulp.series('test:setup', 'flow:check', testWatch(TEST_PATH_SHARED)));
gulp.task('test:shared:once', gulp.series('test:setup', testWatch(TEST_PATH_SHARED)));
gulp.task('test:shared', gulp.series('test:shared:once', () => gulp.watch(TEST_PATH_WATCH, gulp.series('test:shared:once'))));

// gulp.task('test:server:once', ['test:setup'], () =>  testWatch(TEST_PATH_SERVER));
// gulp.task('test:server', ['test:server:once'], () =>  gulp.watch(TEST_PATH_WATCH, ['test:server:once']));
//
// gulp.task('test:client:once', ['test:setup'], () =>  testWatch(TEST_PATH_CLIENT));
// gulp.task('test:client', ['test:client:once'], () =>  gulp.watch(TEST_PATH_WATCH, ['test:client:once']));
//
// gulp.task('test:all:once', ['test:setup'], () =>  testWatch([].concat(TEST_PATH_SERVER, TEST_PATH_SHARED, TEST_PATH_CLIENT)));
// gulp.task('test:all', ['test:all:once'], () =>  gulp.watch(TEST_PATH_WATCH, ['test:all:once']));