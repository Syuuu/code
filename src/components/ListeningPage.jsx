import React, { useState } from 'react';
import { listeningTasks } from '../data/listening';

const ListeningPage = ({ pattern, dayData, onSubmit }) => {
  const [input, setInput] = useState(dayData?.listeningRecord?.correct || '');

  if (!pattern?.listening) {
    return (
      <div className="card">
        <h2>聴解</h2>
        <p className="muted">今日は聴解はありません。</p>
      </div>
    );
  }

  const tasks = listeningTasks.slice(0, Math.max(1, pattern.listening || 1));
  const totalQuestions = tasks.reduce((sum, t) => sum + (t.recommendedQuestionCount || 1), 0);

  const handleSubmit = () => {
    const value = Number(input);
    const validNumber = Number.isNaN(value) ? 0 : Math.max(0, Math.min(value, totalQuestions));
    onSubmit(validNumber, totalQuestions);
  };

  return (
    <div className="card listening-page">
      <div className="card-heading">
        <div>
          <p className="eyebrow">聴解</p>
          <h2>耳をつかってれんしゅう</h2>
          <p className="muted">今日は {totalQuestions} 問だけ。各セット1問ずつ、シンプルに。</p>
        </div>
        <div className="pill soft">めやす 1問 × {tasks.length} セット</div>
      </div>

      <div className="listening-hero">
        <div className="listen-grid">
          {tasks.map((task) => (
            <div key={task.id} className="listen-card">
              <div className="listen-top">
                <h3>{task.title}</h3>
                <span className="pill glass">1問</span>
              </div>
              <p>{task.description}</p>
              <a className="btn-ghost" href={task.videoUrl} target="_blank" rel="noreferrer">
                動画をひらく
              </a>
            </div>
          ))}
        </div>
        <div className="metric-card">
          <div className="metric-label">今日のノルマ</div>
          <div className="metric-number">{totalQuestions}問</div>
          <div className="metric-sub">各セット1問ずつ、ぜんぶで {tasks.length} セット</div>
        </div>
      </div>

      <div className="listening-form">
        <label htmlFor="listeningCorrect">今日は何問 正解しましたか？</label>
        <input
          id="listeningCorrect"
          type="number"
          min="0"
          max={totalQuestions}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="button" className="btn-primary" onClick={handleSubmit}>
          記録する
        </button>
        {dayData?.listeningDone && (
          <div className="success-card">よくがんばりました。分からなかったところは、またいっしょに確認しましょう。</div>
        )}
      </div>
    </div>
  );
};

export default ListeningPage;
