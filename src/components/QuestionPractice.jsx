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

const QuestionPractice = ({ pattern, dayData, onAnswer, focusType }) => {
  const [responses, setResponses] = useState({});

  useEffect(() => {
    setResponses({});
  }, [pattern, dayData?.date]);

  const orderedPattern = useMemo(() => {
    const entries = Object.entries(pattern || {});
    if (!focusType) return entries;
    return entries.sort((a, b) => {
      if (a[0] === focusType) return -1;
      if (b[0] === focusType) return 1;
      return 0;
    });
  }, [focusType, pattern]);

  if (!pattern) {
    return (
      <div className="card">
        <h2>問題</h2>
        <p className="muted">今日はお休みです。</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>問題（単語・文法・読解）</h2>
      <p className="muted">今日のパターンに合わせて出題します。選んだらすぐ正解がわかります。</p>
      <div className="question-columns">
        {orderedPattern.map(([type, limit]) => {
          const answered = dayData?.questionProgress?.[type]?.answered || 0;
          const questionList = bank[type] || [];
          const question = questionList[answered % questionList.length];
          const resp = responses[type] || {};
          const isDone = answered >= limit;

          const handleSelect = (option) => {
            if (isDone || resp.chosen) return;
            const correct = option === question.correctAnswer;
            onAnswer(type, correct, limit);
            setResponses((prev) => ({
              ...prev,
              [type]: {
                chosen: option,
                correct,
                questionId: question.id,
              },
            }));
          };

          return (
            <div key={type} className={`question-card ${focusType === type ? 'focus-card' : ''}`}>
              <div className="question-header">
                <span className="chip">{typeLabels[type]}</span>
                <span className="muted">
                  {answered}/{limit}問
                </span>
              </div>
              {isDone ? (
                <div className="finish-box">今日の{typeLabels[type]}は完了です！ よくがんばりました。</div>
              ) : (
                <div>
                  <h3>{question.title}</h3>
                  <p>{question.question}</p>
                  {question.text && <div className="question-text">{question.text}</div>}
                  {question.readingText && <div className="reading-text">{question.readingText}</div>}
                  <div className="options-grid">
                    {question.options.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={`option-btn ${resp.chosen === option ? 'selected' : ''}`}
                        onClick={() => handleSelect(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  {resp.chosen && (
                    <div className={`feedback ${resp.correct ? 'correct' : 'wrong'}`}>
                      {resp.correct ? '正解！' : 'ざんねん！'}
                      <div className="explanation">{question.explanation}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionPractice;
