'use strict';

const gulp = require('gulp');
const gutil = require('gulp-util');
const mocha = require('gulp-mocha');
const watch = require('gulp-watch');

let watching = false;

const TEST_PATH_WATCH = '{shared,server,client}/**/*.js*(x)';
const TEST_PATH_SERVER = ['shared/**/*.spec.js', 'server/**/*.spec.js'];
const TEST_PATH_CLIENT = ['client/**/*.spec.js', 'client/**/*.spec.jsx'];

const testWatch = (paths) => gulp.src(paths)
  .pipe(mocha({
    bail: true
    , require: ['source-map-support/register', 'ignore-styles', './shared/test-helper.js']
  }))
  .on('error', function (e) {
    gutil.log(e);
    this.emit('end');
  });

gulp.task('test:setup', () => {
  watching = true;
  process.env.NODE_ENV = 'test';
});

gulp.task('test:server:single', ['test:setup'], () =>
  testWatch(TEST_PATH_SERVER));

gulp.task('test:client:single', ['test:setup'], () =>
  testWatch(TEST_PATH_CLIENT));

gulp.task('test:all:single', ['test:setup'], () =>
  testWatch([].concat(TEST_PATH_SERVER, TEST_PATH_CLIENT)));

gulp.task('test:server', ['test:server:single'], () =>
  gulp.watch(TEST_PATH_WATCH, ['test:server:single']));

gulp.task('test:client', ['test:client:single'], () =>
  gulp.watch(TEST_PATH_WATCH, ['test:client:single']));

gulp.task('test:all', ['test:all:single'], () =>
  gulp.watch(TEST_PATH_WATCH, ['test:all:single']));