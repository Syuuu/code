import React from 'react';

const getStatusLabel = (done) => {
  if (done) return '完了';
  return 'まだ';
};

const TodayDashboard = ({ patternKey, pattern, dayData }) => {
  if (!pattern) return null;
  return (
    <div className="card">
      <h2>今日のミッション</h2>
      <p className="muted">今日は「{Object.keys(pattern).join('＋')}」の日です。</p>
      <div className="task-list">
        {Object.entries(pattern).map(([type, count]) => (
          <div key={type} className="task-item">
            <div className="task-title">{type === 'vocab' ? '単語' : type === 'grammar' ? '文法' : type === 'reading' ? '読解' : '聴解'}</div>
            <div className="task-detail">{count}問</div>
            <div className={`status-chip ${dayData?.[`${type}Done`] ? 'done' : 'pending'}`}>
              {getStatusLabel(dayData?.[`${type}Done`])}
            </div>
          </div>
        ))}
        <div className="task-item">
          <div className="task-title">会話</div>
          <div className="task-detail">1トピック</div>
          <div className={`status-chip ${dayData?.conversationDone ? 'done' : 'pending'}`}>
            {getStatusLabel(dayData?.conversationDone)}
          </div>
        </div>
      </div>
      {Object.values(pattern).every((val, idx) => dayData?.[`${Object.keys(pattern)[idx]}Done`]) && dayData?.conversationDone ? (
        <div className="success-card">今日もおつかれさま！ 一歩ずつN2に近づいているよ。</div>
      ) : (
        <p className="muted">二人でゆっくり進めましょう。無理しないでね。</p>
      )}
    </div>
  );
};

export default TodayDashboard;
