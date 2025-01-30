export const brightness = {};

const ranges = [
  { start: 0, end: 500, step: 2 }
];

ranges.forEach(({ start, end, step }) => {
  for (let i = start; i < end; i += step) {
    brightness[i] = `${i / 100}`;
  }
});