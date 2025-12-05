export const dailyPatterns = {
  A: { vocab: 5, reading: 2 },
  B: { grammar: 5, listening: 2 },
  C: { vocab: 5, grammar: 5 },
  D: { reading: 2, listening: 1 },
};

export const weekSchedule = ['C', 'A', 'B', 'C', 'D', 'A', 'B'];

export const patternLabel = (key) => {
  const map = { vocab: '単語', grammar: '文法', reading: '読解', listening: '聴解' };
  return map[key] || key;
};
