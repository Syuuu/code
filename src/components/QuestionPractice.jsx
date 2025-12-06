import React, { useEffect, useMemo, useState } from 'react';
import { mojiQuestions, readingQuestions } from '../data/questions';

const typeLabels = {
  moji: '文字・語彙',
  reading: '読解',
};

const bank = {
  moji: mojiQuestions,
  reading: readingQuestions,
};

const QuestionPractice = ({ type, pattern, dayData, onAnswer }) => {
  const limit = pattern?.[type] ?? 0;
  const answeredCount = dayData?.questionProgress?.[type]?.answered || 0;
  const questionList = bank[type] || [];
  const [currentIndex, setCurrentIndex] = useState(answeredCount);
  const [response, setResponse] = useState({});

  useEffect(() => {
    setCurrentIndex(answeredCount);
    setResponse({});
  }, [type, dayData?.date, questionList.length]);

  const question = useMemo(
    () => questionList[(currentIndex % questionList.length) || 0],
    [currentIndex, questionList]
  );

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

  const reachedLimit = answeredCount >= limit;
  const showFinish = reachedLimit && !response.chosen;

  const handleSelect = (option) => {
    if (showFinish || response.chosen || !question) return;
    const correct = option === question.correctAnswer;
    onAnswer(type, correct, limit);
    setResponse({
      chosen: option,
      correct,
      questionId: question.id,
      correctAnswer: question.correctAnswer,
    });
  };

  const displayIndex = Math.min(limit, currentIndex + 1);
  const nextHint = showFinish ? '今日のこのセクションは完了！' : `${displayIndex} / ${limit} 問目`;
  const progressValue = limit ? Math.min(100, (Math.min(answeredCount, limit) / limit) * 100) : 0;

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
          <div className="meter-fill" style={{ width: `${progressValue}%` }} />
        </div>
        <div className="meter-label">
          {Math.min(answeredCount, limit)}/{limit} 問
        </div>
      </div>

      {showFinish ? (
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
            {question.options.map((option) => {
              const isSelected = response.chosen === option;
              const isCorrectOption = !!response.chosen && option === question.correctAnswer;
              const classNames = ['option-btn'];
              if (isSelected) classNames.push('selected');
              if (isCorrectOption) classNames.push('correct-answer');
              return (
                <button
                  key={option}
                  type="button"
                  className={classNames.join(' ')}
                  onClick={() => handleSelect(option)}
                  disabled={!!response.chosen}
                >
                  {option}
                </button>
              );
            })}
          </div>
          {response.chosen && (
            <div className={`feedback card-inline ${response.correct ? 'correct' : 'wrong'}`}>
              <div className="feedback-title">{response.correct ? '正解！すごい！' : 'ざんねん！だいじょうぶ'} </div>
              <div className="answer-pill">正しいこたえ：{response.correctAnswer}</div>
              <div className="explanation">{question.explanation}</div>
              <div className="muted small">下の「次の問題へ」で、つぎのもんだいへすすみます。</div>
            </div>
          )}
          {response.chosen && (
            <div className="next-row">
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  setResponse({});
                  setCurrentIndex((prev) => Math.max(answeredCount, prev + 1));
                }}
              >
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
