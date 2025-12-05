import React, { useEffect, useMemo, useState } from 'react';
import { vocabQuestions, grammarQuestions, readingQuestions } from '../data/questions';

const typeLabels = {
  vocab: '単語',
  grammar: '文法',
  reading: '読解',
};

const bank = {
  vocab: vocabQuestions,
  grammar: grammarQuestions,
  reading: readingQuestions,
};

const QuestionPractice = ({ type, pattern, dayData, onAnswer }) => {
  const limit = pattern?.[type] ?? 0;
  const answered = dayData?.questionProgress?.[type]?.answered || 0;
  const questionList = bank[type] || [];
  const question = useMemo(
    () => questionList[(answered % questionList.length) || 0],
    [answered, questionList]
  );
  const [response, setResponse] = useState({});

  useEffect(() => {
    setResponse({});
  }, [answered, type, dayData?.date]);

  if (!pattern) {
    return (
      <div className="card">
        <h2>問題</h2>
        <p className="muted">今日はお休みです。</p>
      </div>
    );
  }

  if (!questionList.length) {
    return (
      <div className="card question-page">
        <div className="floating-badge">データがありません</div>
        <h2>{typeLabels[type]}のれんしゅう</h2>
        <p className="muted">まだ問題が入っていません。あとで追加してね。</p>
      </div>
    );
  }

  if (!limit) {
    return (
      <div className="card question-page">
        <div className="floating-badge">今日は{typeLabels[type]}はおやすみ</div>
        <h2>{typeLabels[type]}のれんしゅう</h2>
        <p className="muted">今日のパターンに{typeLabels[type]}はありません。ほかのれんしゅうをしてね。</p>
      </div>
    );
  }

  const isDone = answered >= limit;

  const handleSelect = (option) => {
    if (isDone || response.chosen) return;
    const correct = option === question.correctAnswer;
    onAnswer(type, correct, limit);
    setResponse({
      chosen: option,
      correct,
      questionId: question.id,
    });
  };

  const nextHint = isDone
    ? '今日のこのセクションは完了！'
    : `${answered + 1} / ${limit} 問目`;

  return (
    <div className="card question-page">
      <div className="question-page-header">
        <div>
          <p className="eyebrow">やさしいステップ</p>
          <h2>{typeLabels[type]}のれんしゅう</h2>
          <p className="muted">選んだらすぐ正解がわかります。ゆっくりで大丈夫。</p>
        </div>
        <div className="pill">{nextHint}</div>
      </div>

      <div className="question-hero">
        <div className="bubble">{typeLabels[type]}</div>
        <div className="meter">
          <div className="meter-fill" style={{ width: `${Math.min(100, (answered / limit) * 100)}%` }} />
        </div>
        <div className="meter-label">
          {answered}/{limit} 問
        </div>
      </div>

      {isDone ? (
        <div className="finish-box strong">今日の{typeLabels[type]}は完了！ よくがんばりました。</div>
      ) : (
        <div className="question-body">
          <div className="question-text-box">
            <h3>{question.title}</h3>
            <p>{question.question}</p>
            {question.text && <div className="question-text">{question.text}</div>}
            {question.readingText && <div className="reading-text">{question.readingText}</div>}
          </div>
          <div className="options-grid lively">
            {question.options.map((option) => (
              <button
                key={option}
                type="button"
                className={`option-btn ${response.chosen === option ? 'selected' : ''}`}
                onClick={() => handleSelect(option)}
                disabled={!!response.chosen}
              >
                {option}
              </button>
            ))}
          </div>
          {response.chosen && (
            <div className={`feedback card-inline ${response.correct ? 'correct' : 'wrong'}`}>
              {response.correct ? '正解！' : 'ざんねん！'}
              <div className="explanation">{question.explanation}</div>
              <div className="muted small">下の「次の問題へ」で、つぎのもんだいへすすみます。</div>
            </div>
          )}
          {response.chosen && (
            <div className="next-row">
              <button type="button" className="btn-primary" onClick={() => setResponse({})}>
                次の問題へ
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionPractice;
