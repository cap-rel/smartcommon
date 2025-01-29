const zIndex = {};

const ranges = [
  { start: 0, end: 100, step: 10 },
];

ranges.forEach(({ start, end, step }) => {
  for (let i = start; i < end; i += step) {
    zIndex[i] = `${i}`;
  }
});

export default zIndex;