import path from 'path';

const originalRandomFn = (min, max) => Math.floor(min + Math.random() * (max + 1 - min));
let randomFn = originalRandomFn;

export const getRandom = (min, max) => randomFn(min, max);

export const replaceGetRandom = (randomCb, testCb) => {
  randomFn = randomCb;
  testCb();
  randomFn = originalRandomFn;
};