'use strict';

const gulp = require('gulp');
const gutil = require('gulp-util');
const tape = require('gulp-tape');
const watch = require('gulp-watch');
const tapReporter = require('tap-spec');

const testWatch = (path) => gulp.src(path)
  .pipe(tape({
    reporter: tapReporter()
    , bail: true
  }))
  .on('error', gutil.log);

gulp.task('test:shared:watch', () => {
  testWatch('shared/**/*.spec.js');
  return watch('shared/**/*.js', () => testWatch('shared/**/*.spec.js'));
});