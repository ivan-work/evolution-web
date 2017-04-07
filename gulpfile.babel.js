'use strict';

const gulp = require('gulp');
const gutil = require('gulp-util');
const mocha = require('gulp-mocha');
const watch = require('gulp-watch');

let watching = false;

const testWatch = (paths) => gulp.src(paths)
  .pipe(mocha({
    bail: true
    , require: ['source-map-support/register', 'ignore-styles']
  }))
  //.on('error', () => console.error('error'));
  .on('error', (error) => {
    console.error(error)
    (watching
      ? this.emit('end')
      : process.exit(1));
  });

gulp.task('test:server', () => {
  watching = true;
  const paths = ['./shared/test-helper.js', 'shared/**/*.spec.js', 'server/**/*.spec.js'];
  testWatch(paths);
  return watch('{shared,server,client}/**/*.js*(x)', () => testWatch(paths));
});

gulp.task('test:client', () => {
  watching = true;
  const paths = ['./shared/test-helper.js', 'client/**/*.spec.js', 'client/**/*.spec.jsx'];
  testWatch(paths);
  return watch('{shared,server,client}/**/*.js*(x)', () => testWatch(paths));
});

gulp.task('test:all', () => {
  watching = true;
  const paths = ['./shared/test-helper.js', 'shared/**/*.spec.js', 'server/**/*.spec.js', 'client/**/*.spec.js', 'client/**/*.spec.jsx'];
  testWatch(paths);
  return watch('{shared,server,client}/**/*.js*(x)', () => testWatch(paths));
});