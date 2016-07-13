'use strict';

const gulp = require('gulp');
const gutil = require('gulp-util');
const mocha = require('gulp-mocha');
const watch = require('gulp-watch');

const testWatch = (paths) => gulp.src(paths)
  .pipe(mocha({
    bail: true
  }))
  .on('error', () => console.error('error'));
  //.on('error', (error) => console.error(error));

gulp.task('test:server', () => {
  const paths = ['./shared/test-helper.js', 'shared/**/*.spec.js', 'server/**/*.spec.js'];
  testWatch(paths);
});

gulp.task('test:all:watch', () => {
  const paths = ['./shared/test-helper.js', 'shared/**/*.spec.js', 'server/**/*.spec.js', 'client/**/*.spec.js', 'client/**/*.spec.jsx'];
  testWatch(paths);
  return watch('{shared,server,client}/**/*.js*(x)', () => testWatch(paths));
});