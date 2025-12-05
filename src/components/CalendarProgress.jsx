import React, { useMemo } from 'react';
import { aggregateAccuracy, readAllStudyData } from '../utils/storage';

const getMonthDays = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0).getDate();
  const startWeekday = firstDay.getDay();
  const days = [];
  for (let i = 0; i < startWeekday; i += 1) {
    days.push(null);
  }
  for (let d = 1; d <= lastDay; d += 1) {
    days.push(new Date(year, month, d));
  }
  return { year, month, days };
};

const CalendarProgress = () => {
  const { year, month, days } = getMonthDays();
  const allData = useMemo(() => readAllStudyData(), []);
  const accuracyData = useMemo(() => aggregateAccuracy(), []);

  const dataMap = Object.fromEntries(allData.map((item) => [item.date, item]));

  const getStatus = (dateObj) => {
    if (!dateObj) return 'empty';
    const dateKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    const data = dataMap[dateKey];
    if (!data) return 'empty';
    const flags = [data.vocabDone, data.grammarDone, data.readingDone, data.listeningDone, data.conversationDone];
    if (flags.every(Boolean)) return 'full';
    if (flags.some(Boolean)) return 'partial';
    return 'empty';
  };

  const accuracyMessage = () => {
    const { accuracy } = accuracyData;
    if (accuracy >= 80) return 'この調子なら、N2合格も十分ねらえます！';
    if (accuracy >= 60) return '力が少しずつついてきています。あせらず続けましょう。';
    return '今は土台をつくる時期です。ゆっくりで大丈夫ですよ。';
  };

  return (
    <div className="card">
      <h2>カレンダー・進みぐあい</h2>
      <div className="calendar-grid">
        {['日', '月', '火', '水', '木', '金', '土'].map((d) => (
          <div key={d} className="calendar-cell head">
            {d}
          </div>
        ))}
        {days.map((dateObj, idx) => (
          <div key={idx} className={`calendar-cell ${getStatus(dateObj)}`}>
            {dateObj ? dateObj.getDate() : ''}
          </div>
        ))}
      </div>
      <div className="accuracy-box">
        <div>
          さいきんの正解率：{accuracyData.accuracy}%（{accuracyData.totalCorrect}/{accuracyData.totalAnswered}）
        </div>
        <div className="muted">{accuracyMessage()}</div>
      </div>
    </div>
  );
};

export default CalendarProgress;
