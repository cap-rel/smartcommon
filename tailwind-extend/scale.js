export const scale = {};

const ranges = [
  { start: 0, end: 1000, step: 50 },
];

ranges.forEach(({ start, end, step }) => {
  for (let i = start; i <= end; i += step) {
    scale[i] = `${i / 100}`;
  }
});