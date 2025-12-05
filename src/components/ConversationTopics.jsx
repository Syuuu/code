import React, { useMemo, useState } from 'react';
import { conversationTopics } from '../data/conversationTopics';

const ConversationTopics = ({ dayData, onSelect }) => {
  const [selected, setSelected] = useState(dayData?.conversationTopicId || null);

  const picks = useMemo(() => {
    const shuffled = [...conversationTopics].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }, [dayData?.date]);

  const handleSelect = (topic) => {
    setSelected(topic.id);
    onSelect(topic.id);
  };

  return (
    <div className="card">
      <h2>会話トピック</h2>
      <p className="muted">3つのトピックから一つをえらんで、日本語で話してみましょう。</p>
      <div className="topic-grid">
        {picks.map((topic) => (
          <button
            type="button"
            key={topic.id}
            className={`topic-card ${selected === topic.id ? 'selected' : ''}`}
            onClick={() => handleSelect(topic)}
          >
            <div className="chip">{topic.category}</div>
            <h3>{topic.title}</h3>
            <p>{topic.description}</p>
          </button>
        ))}
      </div>
      {selected && (
        <div className="success-card">トピックをえらびました。二人で日本語で会話してみましょう。</div>
      )}
    </div>
  );
};

export default ConversationTopics;
