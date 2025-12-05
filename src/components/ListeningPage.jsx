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

  const task = listeningTasks[0];
  const totalQuestions = task.recommendedQuestionCount * pattern.listening;

  const handleSubmit = () => {
    const value = Number(input);
    const validNumber = Number.isNaN(value) ? 0 : Math.max(0, Math.min(value, totalQuestions));
    onSubmit(validNumber, totalQuestions);
  };

  return (
    <div className="card">
      <h2>聴解</h2>
      <div className="listening-card">
        <h3>{task.title}</h3>
        <p>{task.description}</p>
        <a className="link" href={task.videoUrl} target="_blank" rel="noreferrer">
          動画をひらく
        </a>
        <p className="muted">めやす：{task.recommendedQuestionCount}問 × {pattern.listening}セット</p>
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
        {dayData?.listeningDone && <div className="success-card">よくがんばりました。分からなかったところは、またいっしょに確認しましょう。</div>}
      </div>
    </div>
  );
};

export default ListeningPage;
