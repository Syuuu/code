import React, { useMemo } from 'react';
import { patternLabel } from '../constants/patterns';

const statusLabel = (done) => {
  if (done) return '完了';
  return 'まだ';
};

const TodayDashboard = ({ patternKey, pattern, dayData, onStart }) => {
  const tasks = useMemo(() => {
    if (!pattern) return [];
    return Object.entries(pattern).map(([type, count]) => ({
      type,
      count,
      title: patternLabel(type),
      done: dayData?.[`${type}Done`],
    }));
  }, [dayData, pattern]);

  const missionDone = useMemo(() => {
    const questionDone = tasks.length > 0 && tasks.every((t) => t.done);
    return questionDone && dayData?.conversationDone;
  }, [dayData?.conversationDone, tasks]);

  if (!pattern) return null;

  const totalRequired = tasks.length + 1;
  const doneCount = tasks.filter((t) => t.done).length + (dayData?.conversationDone ? 1 : 0);
  const progressPercent = Math.round((doneCount / totalRequired) * 100);

  return (
    <div className="card mission-card">
      <div className="mission-header">
        <div>
          <p className="eyebrow">今日のミッション</p>
          <h2>
            パターン{patternKey} ：{tasks.map((t) => `${t.title}${t.count}問`).join(' ＋ ')} ＋ 会話1トピック
          </h2>
          <p className="muted">30分くらいでやさしく終わるコース。クリックですぐ問題へ。</p>
        </div>
        <div className="stickers">
          <span className="sticker">🌸</span>
          <span className="sticker">🎀</span>
          <span className="sticker">✨</span>
        </div>
      </div>

      <div className="progress-track">
        <div className="progress-bar" style={{ width: `${progressPercent}%` }} />
        <div className="progress-label">{doneCount}/{totalRequired} 完了</div>
      </div>

      <div className="task-list fancy">
        {tasks.map((task) => (
          <div key={task.type} className={`task-item upgraded ${task.done ? 'is-done' : ''}`}>
            <div className="task-top">
              <div>
                <div className="task-title">{task.title}</div>
                <div className="task-detail">{task.count}問</div>
              </div>
              <div className={`status-chip ${task.done ? 'done' : 'pending'}`}>{statusLabel(task.done)}</div>
            </div>
            <button type="button" className="btn-link" onClick={() => onStart(task.type)}>
              この{task.title}へすすむ
            </button>
          </div>
        ))}
        <div className={`task-item upgraded ${dayData?.conversationDone ? 'is-done' : ''}`}>
          <div className="task-top">
            <div>
              <div className="task-title">会話</div>
              <div className="task-detail">1トピック</div>
            </div>
            <div className={`status-chip ${dayData?.conversationDone ? 'done' : 'pending'}`}>
              {statusLabel(dayData?.conversationDone)}
            </div>
          </div>
          <button type="button" className="btn-link" onClick={() => onStart('conversation')}>
            今日のトピックをえらぶ
          </button>
        </div>
      </div>

      {missionDone ? (
        <div className="success-card">
          <div className="success-main">今日もおつかれさま！ 一歩ずつN2に近づいているよ。</div>
          <div className="muted">きょうのごほうびに、好きなドリンクでリラックスしよう。</div>
        </div>
      ) : (
        <div className="helper-card">
          <div className="helper-title">わからないときは？</div>
          <div className="muted">無理しなくて大丈夫。わからなかったところを二人で声に出して読みましょう。</div>
          <button type="button" className="btn-primary" onClick={() => onStart(tasks[0]?.type || 'moji')}>
            まずは1問やってみる
          </button>
        </div>
      )}
    </div>
  );
};

export default TodayDashboard;
