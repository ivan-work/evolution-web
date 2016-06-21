'use strict';

const gulp = require('gulp');
const gutil = require('gulp-util');
const tape = require('gulp-tape');
const mocha = require('gulp-mocha');
const watch = require('gulp-watch');

const testWatch = (paths) => gulp.src(paths)
  .pipe(mocha({
    bail: true
  }))
  .on('error', () => console.error('error'));

gulp.task('test:client:watch', () => {
  const paths = ['./shared/test-helper.js', 'shared/**/*.spec.js', 'client/**/*.spec.js'];
  testWatch(paths);
  return watch('{shared,client}/**/*.js', () => testWatch(paths));
});

gulp.task('test:server:watch', () => {
  const paths = ['./shared/test-helper.js', 'shared/**/*.spec.js', 'server/**/*.spec.js'];
  testWatch(paths);
  return watch('{shared,server}/**/*.js', () => testWatch(paths));
});