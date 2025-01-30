export const spacing = {};

const ranges = [
  { start: 0, end: 20, step: 1 },
  { start: 22, end: 80, step: 2 },
  { start: 84, end: 300, step: 4 }
];

ranges.forEach(({ start, end, step }) => {
  for (let i = start; i < end; i += step) {
    spacing[i] = `${i / 4}rem`;
  }
});