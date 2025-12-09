import React, { useEffect, useMemo, useState } from 'react';

const typeLabels = {
  moji: '文字・語彙',
  reading: '読解',
};

const QuestionPractice = ({ type, pattern, dayData, onSave }) => {
  const limit = pattern?.[type] ?? 0;
  const existing = dayData?.questionProgress?.[type] || {};
  const [answered, setAnswered] = useState(existing.answered || '');
  const [correct, setCorrect] = useState(existing.correct || '');
  const [source, setSource] = useState(existing.source || '');

  useEffect(() => {
    setAnswered(existing.answered || '');
    setCorrect(existing.correct || '');
    setSource(existing.source || '');
  }, [dayData?.date, type]);

  const status = useMemo(() => {
    if (!limit) return '今日はおやすみ';
    if ((existing?.answered || 0) >= limit) return '完了済み';
    return '途中';
  }, [existing?.answered, limit]);

  if (!pattern) {
    return (
      <div className="card practice-card">
        <div className="floating-badge">準備中</div>
        <h2>{typeLabels[type]}の記録</h2>
        <p className="muted">今日のパターン情報がまだ読み込まれていません。</p>
      </div>
    );
  }

  if (!limit) {
    return (
      <div className="card practice-card">
        <div className="floating-badge">今日はおやすみ</div>
        <h2>{typeLabels[type]}の記録</h2>
        <p className="muted">今日のパターンにこのセクションはありません。ほかのタブをチェックしてね。</p>
      </div>
    );
  }

  const handleSave = () => {
    const answeredNumber = Math.max(0, Math.min(Number(answered) || 0, limit));
    const correctNumber = Math.max(0, Math.min(Number(correct) || 0, answeredNumber));
    onSave(type, answeredNumber, correctNumber, limit, source.trim());
  };

  const progressPercent = limit ? Math.min(100, ((existing.answered || 0) / limit) * 100) : 0;
  const remaining = Math.max(0, limit - (existing.answered || 0));

  return (
    <div className="card practice-card luxe">
      <div className="practice-header">
        <div>
          <p className="eyebrow">PDFでじっくり</p>
          <h2>{typeLabels[type]}ログ</h2>
          <p className="muted">外部PDFで{limit}問やって、解いた数と正解数だけここでメモしよう。</p>
          <div className="pill soft">{status}</div>
        </div>
        <div className="metric-card glassy">
          <div className="metric-label">今日のノルマ</div>
          <div className="metric-number">{limit}問</div>
          <div className="metric-sub">あと {remaining} 問 で完了</div>
          <div className="progress-track mini">
            <div className="progress-bar" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      <div className="practice-steps">
        <div className="step-card bright">
          <div className="step-icon">📄</div>
          <div>
            <div className="step-title">PDFをひらく</div>
            <div className="step-desc">好きな模試やプリントを使ってください。</div>
          </div>
        </div>
        <div className="step-card bright">
          <div className="step-icon">⏱️</div>
          <div>
            <div className="step-title">目安 {limit}問</div>
            <div className="step-desc">時間は30分以内がオススメ。</div>
          </div>
        </div>
        <div className="step-card bright">
          <div className="step-icon">✍️</div>
          <div>
            <div className="step-title">結果を入力</div>
            <div className="step-desc">正解数だけでOK、あとから編集もできます。</div>
          </div>
        </div>
      </div>

      <div className="input-grid">
        <label className="field">
          <span className="field-label">使ったPDFのメモ（任意）</span>
          <input
            type="text"
            value={source}
            placeholder="例：公式模試 vol.2 p.15"
            onChange={(e) => setSource(e.target.value)}
          />
        </label>
        <label className="field">
          <span className="field-label">解いた数</span>
          <input
            type="number"
            min="0"
            max={limit}
            value={answered}
            onChange={(e) => setAnswered(e.target.value)}
          />
        </label>
        <label className="field">
          <span className="field-label">正解した数</span>
          <input
            type="number"
            min="0"
            max={Number(answered) || limit}
            value={correct}
            onChange={(e) => setCorrect(e.target.value)}
          />
        </label>
      </div>

      <div className="action-row">
        <button
          type="button"
          className="btn-ghost"
          onClick={() => {
            setAnswered(limit);
            setCorrect(Math.max(0, Math.min(limit, limit - 1)));
          }}
        >
          目標を自動入力
        </button>
        <div className="spacer" />
        <button type="button" className="btn-primary" onClick={handleSave}>
          記録する
        </button>
      </div>

      {existing.answered ? (
        <div className="summary-line">
          <div className="badge">最新の記録</div>
          <div>{existing.answered}問中 {existing.correct}問 正解</div>
          {existing.source && <div className="muted">PDFメモ：{existing.source}</div>}
        </div>
      ) : (
        <div className="helper-card subtle">まだ記録がありません。PDFを開いて数を入れてみましょう。</div>
      )}
    </div>
  );
};

export default QuestionPractice;
