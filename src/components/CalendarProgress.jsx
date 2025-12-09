import React, { useMemo } from 'react';
import { dailyPatterns, patternLabel } from '../constants/patterns';
import { conversationTopics } from '../data/conversationTopics';
import {
  aggregateAccuracy,
  aggregateTypeAccuracy,
  readAllStudyData,
  summarizeDayTypes,
} from '../utils/storage';

const formatDateStr = (dateObj) =>
  `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;

const weekdayLabels = ['日', '月', '火', '水', '木', '金', '土'];

const CalendarProgress = ({ compact = false, refreshKey }) => {
  const rangeDays = 14;
  const allData = useMemo(
    () => readAllStudyData().sort((a, b) => new Date(b.date) - new Date(a.date)),
    [refreshKey]
  );
  const accuracyData = useMemo(() => aggregateAccuracy(), [refreshKey]);
  const typeAccuracy = useMemo(() => aggregateTypeAccuracy(), [refreshKey]);
  const topicMap = useMemo(
    () => Object.fromEntries(conversationTopics.map((t) => [t.id, t.title])),
    []
  );

  const dataMap = useMemo(() => Object.fromEntries(allData.map((item) => [item.date, item])), [allData]);

  const weeklyDays = useMemo(() => {
    const today = new Date();
    const arr = [];
    for (let i = 0; i < rangeDays; i += 1) {
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
      const typeStats = summarizeDayTypes(data);
      const patternTitle = requiredTypes.length > 0 ? requiredTypes.map((t) => patternLabel(t)).join('＋') : '計画なし';
      arr.push({
        dateObj: d,
        data,
        label: `${d.getMonth() + 1}/${d.getDate()}（${weekdayLabels[d.getDay()]}）`,
        status,
        doneCount,
        requiredCount,
        accuracy,
        typeStats,
        patternTitle,
        requiredTypes,
        sources: ['moji', 'reading']
          .map((t) => data?.questionProgress?.[t]?.source)
          .filter(Boolean),
      });
    }
    return arr;
  }, [dataMap, rangeDays]);

  const weeklyTotals = useMemo(() => {
    const totals = {
      answered: 0,
      correct: 0,
      fullDays: 0,
      partialDays: 0,
      type: {},
    };

    weeklyDays.forEach((item) => {
      const { data, status, typeStats } = item;
      if (status === 'full') totals.fullDays += 1;
      if (status === 'partial') totals.partialDays += 1;
      const answered = data?.totalCount || 0;
      const correct = data?.correctCount || 0;
      totals.answered += answered;
      totals.correct += correct;

      Object.entries(typeStats || {}).forEach(([type, value]) => {
        const current = totals.type[type] || { answered: 0, correct: 0 };
        totals.type[type] = {
          answered: current.answered + (value.answered || 0),
          correct: current.correct + (value.correct || 0),
        };
      });
    });

    const bestDay = weeklyDays.reduce(
      (best, day) => {
        if (day.accuracy === null) return best;
        if (!best || (day.accuracy || 0) > (best.accuracy || 0)) return day;
        return best;
      },
      null
    );

    const accuracy = totals.answered > 0 ? Math.round((totals.correct / totals.answered) * 100) : 0;

    return { ...totals, accuracy, bestDay };
  }, [weeklyDays]);

  const accuracyMessage = () => {
    const { accuracy } = accuracyData;
    if (accuracy >= 80) return 'この調子なら、N2合格も十分ねらえます！';
    if (accuracy >= 60) return '力が少しずつついてきています。あせらず続けましょう。';
    return '今は土台をつくる時期です。ゆっくりで大丈夫ですよ。';
  };

  const renderTypeRows = (typeStats, requiredTypes = [], pattern = {}) => (
    <div className="type-rows">
      {['moji', 'reading', 'listening'].map((type) => {
        const stats = typeStats?.[type];
        const required = requiredTypes.includes(type) ? pattern?.[type] : null;
        if (!stats && !required) return null;
        const accuracy = stats?.answered > 0 ? Math.round((stats.correct / stats.answered) * 100) : null;
        const labelMap = { moji: '文字・語彙', reading: '読解', listening: '聴解' };
        return (
          <div key={type} className="type-row">
            <div className="type-row-top">
              <span className="type-row-label">{labelMap[type]}</span>
              <span className="type-row-count">{stats ? `${stats.correct}/${stats.answered} 正解` : '未入力'}</span>
            </div>
            <div className="mini-track">
              <div
                className="mini-bar"
                style={{ width: `${Math.min(100, accuracy !== null ? accuracy : stats?.answered ? 30 : 5)}%` }}
              />
            </div>
            <div className="type-row-meta">
              <span className="meta-pill">{required ? `ノルマ ${required}問` : 'ログのみ'}</span>
              <span className="meta-pill subtle">{accuracy !== null ? `正解率 ${accuracy}%` : 'まだ記録なし'}</span>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderWeekCards = () => (
    <div className="week-strip luxe">
      {weeklyDays.map((item) => (
        <div key={item.label} className={`week-card status-${item.status}`}>
          <div className="week-card-top">
            <div>
              <div className="week-date">{item.label}</div>
              <div className="week-pattern">パターン{item.data?.pattern || 'ー'}：{item.patternTitle}</div>
            </div>
            <div className={`status-chip jumbo ${item.status}`}>
              {item.status === 'full' ? '完了' : item.status === 'partial' ? 'がんばり中' : 'まだ'}
            </div>
          </div>
          <div className="week-numbers">
            <div className="week-number big">{item.status === 'empty' ? '0/3' : `${item.doneCount}/${item.requiredCount}`}</div>
            <div className="week-sub">タスク完了</div>
            <div className="week-accuracy">{item.accuracy !== null ? `正解率 ${item.accuracy}%` : '正解率 ー'}</div>
          </div>
          {renderTypeRows(item.typeStats, item.requiredTypes, dailyPatterns[item.data?.pattern] || {})}
          <div className="week-meta-row">
            {item.data?.conversationTopicId && (
              <div className="topic-pill">会話：{topicMap[item.data.conversationTopicId] || '選択済み'}</div>
            )}
            {item.sources.length > 0 && <div className="source-note">PDFメモ：{item.sources.join(' ／ ')}</div>}
          </div>
        </div>
      ))}
    </div>
  );

  if (compact) {
    return (
      <div className="card calendar-card">
        <div className="card-heading">
          <div>
            <p className="eyebrow">最近14日</p>
            <h2>ミニカレンダー</h2>
            <p className="muted">毎日の完了数と正解率をサッとチェック</p>
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
        <div className="type-summary">
          {['moji', 'reading', 'listening'].map((type) => {
            const stats = typeAccuracy[type];
            if (!stats) return null;
            const labelMap = { moji: '文字・語彙', reading: '読解', listening: '聴解' };
            return (
              <div key={type} className="type-summary-card">
                <div className="type-summary-title">{labelMap[type]}</div>
                <div className="type-summary-numbers">{stats.correct}/{stats.answered} 正解</div>
                <div className="type-summary-acc">正解率 {stats.accuracy}%</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="card calendar-card luxe">
      <div className="calendar-hero">
        <div>
          <p className="eyebrow">学習カレンダー</p>
          <h2 className="calendar-title">14日ハイライト</h2>
          <p className="muted">過去のPDFログと会話をぜんぶ可視化。数字で成長を感じよう。</p>
          <div className="legend">
            <span className="legend-dot full" />完了 <span className="legend-dot partial" />がんばり中
          </div>
        </div>
        <div className="metric-grid">
          <div className="metric-card">
            <div className="metric-label">合計 正解/解答</div>
            <div className="metric-value">{weeklyTotals.correct}/{weeklyTotals.answered}</div>
            <div className="metric-sub">正解率 {weeklyTotals.accuracy}%</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">完了した日</div>
            <div className="metric-value">{weeklyTotals.fullDays}日</div>
            <div className="metric-sub">部分クリア {weeklyTotals.partialDays}日</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">ハイライト</div>
            <div className="metric-value">{weeklyTotals.bestDay ? weeklyTotals.bestDay.label : 'まだなし'}</div>
            <div className="metric-sub">
              {weeklyTotals.bestDay?.accuracy ? `最高 正解率 ${weeklyTotals.bestDay.accuracy}%` : '記録をつくろう'}
            </div>
          </div>
        </div>
      </div>

      {renderWeekCards()}

      <div className="type-summary wide">
        {['moji', 'reading', 'listening'].map((type) => {
          const stats = typeAccuracy[type];
          if (!stats) return null;
          const labelMap = { moji: '文字・語彙', reading: '読解', listening: '聴解' };
          return (
            <div key={type} className="type-summary-card large">
              <div className="type-summary-title">{labelMap[type]}</div>
              <div className="type-summary-numbers">{stats.correct}/{stats.answered} 正解</div>
              <div className="type-summary-acc">正解率 {stats.accuracy}%</div>
            </div>
          );
        })}
      </div>

      <div className="accuracy-box luxe">
        <div>
          さいきんの正解率：{accuracyData.accuracy}%（{accuracyData.totalCorrect}/{accuracyData.totalAnswered}）
        </div>
        <div className="muted">{accuracyMessage()}</div>
      </div>
    </div>
  );
};

export default CalendarProgress;
