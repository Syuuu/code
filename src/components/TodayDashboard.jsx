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

  const steps = useMemo(
    () => [...tasks, { type: 'conversation', title: '会話', done: dayData?.conversationDone }],
    [dayData?.conversationDone, tasks]
  );

  if (!pattern) return null;

  const totalRequired = steps.length;
  const doneCount = steps.filter((t) => t.done).length;
  const progressPercent = Math.round((doneCount / totalRequired) * 100);

    return (
      <div className="card mission-card spacious luxe">
        <div className="mission-hero wide">
          <div>
            <p className="eyebrow">今日のミッション</p>
            <h2 className="mission-title">パターン{patternKey}</h2>
            <p className="mission-sub">
              PDFで {tasks.map((t) => `${t.title}${t.count}問`).join(' ＋ ')} ＋ 会話1トピック
            </p>
            <div className="mission-tags">
              <span className="tag-soft">やさしい30分</span>
              <span className="tag-soft">パステルルーム</span>
              <span className="tag-soft">データで管理</span>
            </div>
          </div>
          <div className="hero-pill big">
            <div className="pill-title">今日の進み</div>
            <div className="pill-number">{doneCount}/{totalRequired}</div>
            <div className="pill-sub">{doneCount === totalRequired ? '全部クリア！' : `あと${totalRequired - doneCount}ステップ`}</div>
            <div className="progress-track mini">
              <div className="progress-bar" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>

      <div className="mission-grid split">
        <div className="mission-progress-panel soft">
          <div className="panel-header">
            <div>
              <div className="panel-label">ステップ順</div>
              <div className="panel-title">PDF→入力→完了</div>
            </div>
            <div className="stickers">
              <span className="sticker">🌸</span>
              <span className="sticker">🎀</span>
              <span className="sticker">✨</span>
            </div>
          </div>
          <div className="progress-steps roomy luxe">
            {steps.map((step, idx) => (
              <button
                key={step.type}
                type="button"
                className={`progress-step ${step.done ? 'done' : ''}`}
                onClick={() => onStart(step.type)}
              >
                <div className="step-dot">{step.done ? '✓' : idx + 1}</div>
                <div>
                  <div className="step-label strong">{step.title}</div>
                  <div className="step-hint">{step.done ? '完了！' : 'クリックで開始'}</div>
                </div>
                <div className="step-count">
                  {step.type === 'conversation' ? '1トピック' : `${pattern?.[step.type] || step.count}問`}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mission-task-panel soft">
          <div className="panel-header">
            <div>
              <div className="panel-label">やることリスト</div>
              <div className="panel-title">ゆったりクリア</div>
            </div>
          </div>
          <div className="task-list fancy roomy">
            {tasks.map((task) => (
              <div key={task.type} className={`task-item upgraded wide ${task.done ? 'is-done' : ''}`}>
                <div className="task-top">
                  <div>
                    <div className="task-title">{task.title}</div>
                    <div className="task-detail">PDFで {task.count}問</div>
                  </div>
                  <div className={`status-chip ${task.done ? 'done' : 'pending'}`}>{statusLabel(task.done)}</div>
                </div>
                <div className="task-actions">
                  <button type="button" className="btn-link" onClick={() => onStart(task.type)}>
                    この{task.title}へすすむ
                  </button>
                </div>
              </div>
            ))}
            <div className={`task-item upgraded wide ${dayData?.conversationDone ? 'is-done' : ''}`}>
              <div className="task-top">
                <div>
                  <div className="task-title">会話</div>
                  <div className="task-detail">1トピック</div>
                </div>
                <div className={`status-chip ${dayData?.conversationDone ? 'done' : 'pending'}`}>
                  {statusLabel(dayData?.conversationDone)}
                </div>
              </div>
              <div className="task-actions">
                <button type="button" className="btn-link" onClick={() => onStart('conversation')}>
                  今日のトピックをえらぶ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {missionDone ? (
        <div className="success-card big">
          <div className="success-main">今日もおつかれさま！ 一歩ずつN2に近づいているよ。</div>
          <div className="muted">きょうのごほうびに、好きなドリンクでリラックスしよう。</div>
        </div>
      ) : (
        <div className="helper-card wide">
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
