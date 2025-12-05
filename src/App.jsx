import React, { useEffect, useMemo, useState } from 'react';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import TodayDashboard from './components/TodayDashboard';
import QuestionPractice from './components/QuestionPractice';
import ListeningPage from './components/ListeningPage';
import ConversationTopics from './components/ConversationTopics';
import CalendarProgress from './components/CalendarProgress';
import { loadDayData, markTaskDone, recordQuestionResult, updateListeningRecord } from './utils/storage';

const dailyPatterns = {
  A: { vocab: 5, reading: 2 },
  B: { grammar: 5, listening: 2 },
  C: { vocab: 5, grammar: 5 },
  D: { reading: 2, listening: 1 },
};

const weekSchedule = ['C', 'A', 'B', 'C', 'D', 'A', 'B'];

const patternLabel = (key) => {
  const map = { vocab: '単語', grammar: '文法', reading: '読解', listening: '聴解' };
  return map[key] || key;
};

const App = () => {
  const [currentView, setCurrentView] = useState('today');
  const [patternKey, setPatternKey] = useState('A');
  const [dayData, setDayData] = useState(null);

  useEffect(() => {
    const today = new Date();
    const weekday = today.getDay();
    const key = weekSchedule[weekday] || 'A';
    setPatternKey(key);
    const loaded = loadDayData(key);
    setDayData(loaded);
  }, []);

  const pattern = useMemo(() => dailyPatterns[patternKey], [patternKey]);
  const questionPattern = useMemo(
    () => Object.fromEntries(Object.entries(pattern || {}).filter(([k]) => k !== 'listening')),
    [pattern]
  );

  const handleQuestionAnswer = (type, correct, limit) => {
    setDayData((prev) => recordQuestionResult(prev, type, correct, limit));
  };

  const handleListeningSubmit = (correct, total) => {
    setDayData((prev) => updateListeningRecord(prev, correct, total));
  };

  const handleConversationSelect = (topicId) => {
    setDayData((prev) => markTaskDone(prev, 'conversationDone', { conversationTopicId: topicId }));
  };

  const renderContent = () => {
    switch (currentView) {
      case 'questions':
        return <QuestionPractice pattern={questionPattern} dayData={dayData} onAnswer={handleQuestionAnswer} />;
      case 'listening':
        return <ListeningPage pattern={pattern} dayData={dayData} onSubmit={handleListeningSubmit} />;
      case 'conversation':
        return <ConversationTopics dayData={dayData} onSelect={handleConversationSelect} />;
      case 'calendar':
        return <CalendarProgress />;
      case 'today':
      default:
        return <TodayDashboard patternKey={patternKey} pattern={pattern} dayData={dayData} />;
    }
  };

  const patternDescription = pattern
    ? Object.entries(pattern)
        .map(([k, v]) => `${patternLabel(k)}：${v}問`)
        .join('、 ')
    : '';

  return (
    <div className="app">
      <TopBar />
      <div className="layout">
        <Sidebar current={currentView} onChange={setCurrentView} />
        <main className="main">
          <div className="pattern-banner">今日はパターン{patternKey}（{patternDescription} ＋ 会話1トピック）</div>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
