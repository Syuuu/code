const PREFIX = 'studyData_';

const withStorage = (fn) => {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  return fn(window.localStorage);
};

export const formatDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${PREFIX}${year}-${month}-${day}`;
};

export const loadDayData = (patternKey) =>
  withStorage((storage) => {
    const key = formatDateKey();
    const raw = storage.getItem(key);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        storage.removeItem(key);
      }
    }
    const fresh = {
      date: key.replace(PREFIX, ''),
      pattern: patternKey,
      mojiDone: false,
      readingDone: false,
      listeningDone: false,
      conversationDone: false,
      correctCount: 0,
      totalCount: 0,
      questionProgress: {},
      listeningRecord: null,
    };
    storage.setItem(key, JSON.stringify(fresh));
    return fresh;
  }) || {
    date: '',
    pattern: patternKey,
    mojiDone: false,
    readingDone: false,
    listeningDone: false,
    conversationDone: false,
    correctCount: 0,
    totalCount: 0,
    questionProgress: {},
    listeningRecord: null,
  };

export const saveDayData = (data) =>
  withStorage((storage) => {
    const key = formatDateKey();
    storage.setItem(key, JSON.stringify(data));
  });

export const recordQuestionResult = (data, type, isCorrect, requiredCount = 0) => {
  const updated = { ...data };
  const progress = { ...(updated.questionProgress || {}) };
  const current = progress[type] || { answered: 0, correct: 0 };
  const newAnswered = current.answered + 1;
  const newCorrect = current.correct + (isCorrect ? 1 : 0);
  progress[type] = { answered: newAnswered, correct: newCorrect };
  updated.questionProgress = progress;
  updated.totalCount = (updated.totalCount || 0) + 1;
  updated.correctCount = (updated.correctCount || 0) + (isCorrect ? 1 : 0);

  if (requiredCount && newAnswered >= requiredCount) {
    const doneKey = `${type}Done`;
    updated[doneKey] = true;
  }

  saveDayData(updated);
  return updated;
};

export const markTaskDone = (data, key, extra = {}) => {
  const updated = { ...data, [key]: true, ...extra };
  saveDayData(updated);
  return updated;
};

export const updateListeningRecord = (data, correct, total) => {
  const prevRecord = data.listeningRecord || { correct: 0, total: 0 };
  const diffCorrect = correct - (prevRecord.correct || 0);
  const diffTotal = total - (prevRecord.total || 0);
  const updated = {
    ...data,
    listeningRecord: { correct, total },
    correctCount: (data.correctCount || 0) + diffCorrect,
    totalCount: (data.totalCount || 0) + diffTotal,
    listeningDone: true,
  };
  saveDayData(updated);
  return updated;
};

export const readAllStudyData = () =>
  withStorage((storage) => {
    const items = [];
    for (let i = 0; i < storage.length; i += 1) {
      const key = storage.key(i);
      if (key && key.startsWith(PREFIX)) {
        const raw = storage.getItem(key);
        try {
          const obj = JSON.parse(raw);
          items.push(obj);
        } catch (e) {
          // ignore broken data
        }
      }
    }
    return items;
  }) || [];

export const aggregateAccuracy = () => {
  const items = readAllStudyData();
  const totalCorrect = items.reduce((sum, day) => sum + (day.correctCount || 0), 0);
  const totalAnswered = items.reduce((sum, day) => sum + (day.totalCount || 0), 0);
  const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
  return { totalCorrect, totalAnswered, accuracy };
};

export const summarizeDayTypes = (day) => {
  const stats = {};
  const progress = day?.questionProgress || {};

  Object.entries(progress).forEach(([type, value]) => {
    stats[type] = {
      answered: value?.answered || 0,
      correct: value?.correct || 0,
    };
  });

  if (day?.listeningRecord) {
    const { correct = 0, total = 0 } = day.listeningRecord;
    stats.listening = {
      answered: (stats.listening?.answered || 0) + total,
      correct: (stats.listening?.correct || 0) + correct,
    };
  }

  return stats;
};

export const aggregateTypeAccuracy = () => {
  const items = readAllStudyData();
  const totals = {};

  items.forEach((day) => {
    const stats = summarizeDayTypes(day);
    Object.entries(stats).forEach(([type, value]) => {
      const current = totals[type] || { answered: 0, correct: 0 };
      totals[type] = {
        answered: current.answered + (value.answered || 0),
        correct: current.correct + (value.correct || 0),
      };
    });
  });

  const withAccuracy = Object.fromEntries(
    Object.entries(totals).map(([type, value]) => {
      const answered = value.answered || 0;
      const correct = value.correct || 0;
      const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;
      return [type, { ...value, accuracy }];
    })
  );

  return withAccuracy;
};
