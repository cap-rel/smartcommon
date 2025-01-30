export const transitionDuration = {};

const ranges = [
  { start: 0, end: 1000, step: 50 },
  { start: 2000, end: 20000, step: 1000 },
];

ranges.forEach(({ start, end, step }) => {
  for (let i = start; i <= end; i += step) {
    transitionDuration[i] = `${i}ms`;
  }
});