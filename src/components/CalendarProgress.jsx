import React, { useMemo } from 'react';
import { dailyPatterns } from '../constants/patterns';
import { aggregateAccuracy, readAllStudyData } from '../utils/storage';

const formatDateStr = (dateObj) =>
  `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;

const weekdayLabels = ['日', '月', '火', '水', '木', '金', '土'];

const CalendarProgress = ({ compact = false, refreshKey }) => {
  const allData = useMemo(
    () => readAllStudyData().sort((a, b) => new Date(a.date) - new Date(b.date)),
    [refreshKey]
  );
  const accuracyData = useMemo(() => aggregateAccuracy(), [refreshKey]);

  const dataMap = useMemo(() => Object.fromEntries(allData.map((item) => [item.date, item])), [allData]);

  const weeklyDays = useMemo(() => {
    const today = new Date();
    const arr = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = formatDateStr(d);
      const data = dataMap[key];
      const pattern = dailyPatterns[data?.pattern] || {};
      const requiredTypes = Object.keys(pattern);
      const doneCount =
        requiredTypes.reduce((sum, t) => sum + (data?.[`${t}Done`] ? 1 : 0), 0) + (data?.conversationDone ? 1 : 0);
      const requiredCount = requiredTypes.length + 1;
      const status = data ? (doneCount >= requiredCount ? 'full' : doneCount > 0 ? 'partial' : 'empty') : 'empty';
      const accuracy = data?.totalCount > 0 ? Math.round((data.correctCount / data.totalCount) * 100) : null;
      arr.push({
        dateObj: d,
        data,
        label: `${d.getMonth() + 1}/${d.getDate()}（${weekdayLabels[d.getDay()]}）`,
        status,
        doneCount,
        requiredCount,
        accuracy,
      });
    }
    return arr;
  }, [dataMap]);

  const accuracyMessage = () => {
    const { accuracy } = accuracyData;
    if (accuracy >= 80) return 'この調子なら、N2合格も十分ねらえます！';
    if (accuracy >= 60) return '力が少しずつついてきています。あせらず続けましょう。';
    return '今は土台をつくる時期です。ゆっくりで大丈夫ですよ。';
  };

  const renderWeekCards = () => (
    <div className="week-strip">
      {weeklyDays.map((item) => (
        <div key={item.label} className={`week-card status-${item.status}`}>
          <div className="week-date">{item.label}</div>
          <div className="week-stats">{item.status === 'empty' ? 'まだ' : `${item.doneCount}/${item.requiredCount}タスク`}</div>
          <div className="week-accuracy">{item.accuracy !== null ? `正解率 ${item.accuracy}%` : '正解率 ー'}</div>
        </div>
      ))}
    </div>
  );

  if (compact) {
    return (
      <div className="card calendar-card">
        <div className="card-heading">
          <div>
            <p className="eyebrow">最近7日</p>
            <h2>ミニカレンダー</h2>
            <p className="muted">毎日の完了数と正解率をちらっとチェック</p>
          </div>
          <div className="legend">
            <span className="legend-dot full" />完了 <span className="legend-dot partial" />がんばり中
          </div>
        </div>
        {renderWeekCards()}
        <div className="accuracy-box">
          <div>
            さいきんの正解率：{accuracyData.accuracy}%（{accuracyData.totalCorrect}/{accuracyData.totalAnswered}）
          </div>
          <div className="muted">{accuracyMessage()}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card calendar-card">
      <div className="card-heading">
        <div>
          <p className="eyebrow">学習カレンダー</p>
          <h2>カレンダー・進みぐあい</h2>
          <p className="muted">直近7日ぶんの完了状況と正解率</p>
        </div>
        <div className="legend">
          <span className="legend-dot full" />完了 <span className="legend-dot partial" />がんばり中
        </div>
      </div>
      {renderWeekCards()}
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
