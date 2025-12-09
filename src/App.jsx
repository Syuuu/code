import React, { useEffect, useMemo, useState } from 'react';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import TodayDashboard from './components/TodayDashboard';
import QuestionPractice from './components/QuestionPractice';
import ListeningPage from './components/ListeningPage';
import ConversationTopics from './components/ConversationTopics';
import CalendarProgress from './components/CalendarProgress';
import { dailyPatterns, patternLabel, weekSchedule } from './constants/patterns';
import {
  formatDateKey,
  loadDayData,
  markTaskDone,
  recordQuestionResult,
  updateListeningRecord,
} from './utils/storage';

const App = () => {
  const [currentView, setCurrentView] = useState('today');
  const [patternKey, setPatternKey] = useState('A');
  const [dayData, setDayData] = useState(null);

  useEffect(() => {
    const syncToday = () => {
      const today = new Date();
      const weekday = today.getDay();
      const nextPattern = weekSchedule[weekday] || 'A';
      const todayDate = formatDateKey().replace('studyData_', '');
      setPatternKey(nextPattern);
      setDayData((current) => {
        if (current?.date === todayDate && current?.pattern === nextPattern) return current;
        return loadDayData(nextPattern);
      });
    };

    syncToday();
    const timer = setInterval(syncToday, 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  const pattern = useMemo(() => dailyPatterns[patternKey], [patternKey]);
  const handleQuestionAnswer = (type, correct, limit) => {
    setDayData((prev) => recordQuestionResult(prev, type, correct, limit));
  };

  const handleListeningSubmit = (correct, total) => {
    setDayData((prev) => updateListeningRecord(prev, correct, total));
  };

  const handleConversationSelect = (topicId) => {
    setDayData((prev) => markTaskDone(prev, 'conversationDone', { conversationTopicId: topicId }));
  };

  const handleStartFromToday = (type) => {
    if (type === 'listening') {
      setCurrentView('listening');
    } else if (type === 'conversation') {
      setCurrentView('conversation');
    } else {
      setCurrentView(type || 'moji');
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'moji':
        return <QuestionPractice type="moji" pattern={pattern} dayData={dayData} onAnswer={handleQuestionAnswer} />;
      case 'reading':
        return <QuestionPractice type="reading" pattern={pattern} dayData={dayData} onAnswer={handleQuestionAnswer} />;
      case 'listening':
        return <ListeningPage pattern={pattern} dayData={dayData} onSubmit={handleListeningSubmit} />;
      case 'conversation':
        return <ConversationTopics dayData={dayData} onSelect={handleConversationSelect} />;
      case 'calendar':
        return <CalendarProgress />;
      case 'today':
      default:
        return (
          <div className="home-grid">
            <TodayDashboard
              patternKey={patternKey}
              pattern={pattern}
              dayData={dayData}
              onStart={handleStartFromToday}
            />
            <CalendarProgress compact refreshKey={`${dayData?.date}-${dayData?.totalCount}`} />
          </div>
        );
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
