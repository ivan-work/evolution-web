export const RandomGenerator = {
  generate: (min, max) => min + Math.floor(Math.random() * (max - min))
};