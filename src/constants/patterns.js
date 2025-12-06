export const dailyPatterns = {
  A: { moji: 6, reading: 2 },
  B: { moji: 6, listening: 2 },
  C: { moji: 8, reading: 1 },
  D: { reading: 2, listening: 1 },
};

export const weekSchedule = ['C', 'A', 'B', 'C', 'D', 'A', 'B'];

export const patternLabel = (key) => {
  const map = { moji: '文字・語彙', reading: '読解', listening: '聴解' };
  return map[key] || key;
};
